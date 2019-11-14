/**
 * Abdessamad, the gentle discord bot
 * Created to interact in discord class groups.
 * 
 * @version 2.0
 * @author Nathanaël Houn
 * @author Promo 2018 des CMI Informatique de Besançon
 */

const functions = require('../functions/message_functions.js');
const features = require('../functions/message_features.js')

module.exports = (client, dbClient, msg) => {

    if (msg.content == "ping") {
        return features.ping(msg)
    }

    if (msg.content.startsWith("!")) {
        var command = functions.getCommandFrom(msg)
        var options = functions.getOptionsFrom(msg)
        var args = functions.getArgsFrom(msg)

        switch (command) {
            case "activity":
                if (msg.deletable) msg.delete()
                if (options.length == 1) {
                    if (options[0] == "show_history") {
                        if (typeof (args[0]) != "string") {
                            msg.reply(":vs: Il faut me dire combien d'activités je suis censé me rappeler !")
                            break
                        }
                        features.activity_showHistory(msg, dbClient, parseInt(args[0]))
                        break
                    }

                    if (options[0] == 'set') {
                        features.activity_set(msg, client, dbClient, args.join(' '))
                        break
                    }
                }
                // Syntax error
                features.sendHelp(msg.author, "activity", true)
                break
            // ----------------------------------------------------------------

            case "hw":
                if (msg.deletable) msg.delete()
                if (options.length < 1 || 2 < options.length) {
                    features.sendHelp(msg.author, "hw", true)
                    break
                }

                if (options.length == 2) {
                    if (options[0] != "show") {
                        features.sendHelp(msg.author, "hw", true)
                        break
                    }
                    features.hwshow(msg, dbClient, true)
                    break
                }

                switch (options[0]) {
                    case "add":
                        if (args.length < 4) {
                            features.sendHelp(msg.author, "hwArgs", true)
                            break
                        }
                        let homework = {
                            "type": args[0],
                            "date": functions.string2date(args[1]),
                            "subject": args[2],
                            "label": args[3]
                        }
                        for (let i = 4; i < args.length; i++) {
                            homework.label += ' ' + args[i];
                        }

                        if (!functions.isDateCorrect(homework.date)) {
                            features.sendHelp(msg.author, "hwDate", true)
                            break
                        }
                        features.hwadd(msg, dbClient, homework)
                        break

                    case "rm":
                        if (args.length != 1 || options.length != 1) {
                            features.sendHelp(msg.author, "hw", true)
                            break
                        }
                        features.hwdelete(msg,dbClient,args[0])
                        break

                    case "show":
                        let showIds = options[1] == "ids" || options[1] == "id" || options[2] == "ids" || options[2] == "id"

                        var whichOne = 0;
                        if (args.length > 0) {
                            switch (args[0]) {
                                case "hw":
                                    whichOne = 1
                                    break

                                case "ds":
                                    whichOne = 2
                                    break

                                case "project":
                                    whichOne = 3
                                    break
                            }
                        }
                        features.hwshow(msg, dbClient, showIds, whichOne)
                        break

                    default:
                        features.sendHelp(msg.author, "hw", options[0] != "help")
                }

                break
            // ----------------------------------------------------------------

            case "int":
                if (msg.deletable) msg.delete()

                if (options.length > 2) {
                    msg.author.send(":x: Mauvaise option.")
                    features.sendHelp(msg.author, "int", true)
                    break
                }

                if (options[0] == "add" || options[0] == "remove") {
                    if (options.length != 1 || args.length != 3 || args[0].substr(0, 2) != '<@' || isNaN(args[2])) {
                        msg.author.send(":x: Mauvais arguments.")
                        features.sendHelp(msg.author, "int", true)
                        break
                    }

                    let user = msg.mentions.members.first()
                    let isJustified = args[1].toLowerCase() == "true"
                    var points = parseInt(args[2])
                    if (options[0] == "remove") {
                        points *= -1
                    }
                    features.intadd(msg, dbClient, user, points, isJustified)
                } else if (options[0] == "show") {
                    if (options.length == 1) {
                        features.intshowAll(msg, dbClient)
                    } else {
                        if (options[1] == "justified") {
                            features.intshowJustified(msg, dbClient)
                        } else {
                            features.intshowUnjustified(msg, dbClient)
                        }
                    }
                }

                break
            // ----------------------------------------------------------------

            case "ping":
                features.ping(msg)
                break;


            case "teams":
                if (msg.deletable) msg.delete()

                if (args.length != 2 || args[1].substr(0, 2) != '<@') {
                    msg.author.send(":x: Mauvais arguments.")
                    features.sendHelp(msg.author, "teams", true)
                    break
                }

                var role = msg.guild.roles.find(x => x.id == msg.mentions.roles.first().id)
                if (role === undefined || role === null) {
                    msg.author.send(":x: Le rôle *" + roleName + "* n'existe pas sur ce serveur, vérifie l'orthographe.")
                    features.sendHelp(msg.author, "teams", true)
                    break
                }

                features.teams_make(msg, args[0], role)
                break
            // ----------------------------------------------------------------

            case "help":
                var hasDoneError = false
                if (args.length > 0) {
                    var type = args[0]
                }

            default:
                if (type === undefined) {
                    type = "general"
                }

                features.sendHelp(msg.author, type, (hasDoneError === undefined))
                if (msg.deletable) msg.delete()
            // ----------------------------------------------------------------
        }
    }
}