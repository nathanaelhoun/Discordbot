/**
 * Abdessamad, the gentle discord bot
 * Created to interact in discord class groups.
 * 
 * @version 2.0
 * @author Nathanaël Houn
 * @author Promo 2018 des CMI Informatique de Besançon
 */

const db = require('./database.js')
const functions = require('./message_functions.js')

/**
 * Answer "pong" to "ping"
 * @param {Message} message
 */
exports.ping = function (message) {
    message.channel.send("Pong :baseball:")
}

exports.sendHelp = function (recipient, reason, hasDoneError) {
    var text = "";
    if (hasDoneError) {
        text += "Je n'ai pas compris ce que tu as voulu dire... Vérifie ça :wink: \n"
    }

    let hwText = "** Comment utiliser `!hw` : ** \n :small_orange_diamond: `!hw --add hw/ds/project dd/mm/yy matière libellé` pour ajouter des devoirs, un DS ou un projet, \n :small_orange_diamond: `!hw --show [hw/ds/project] [--ids]` pour voir les devoirs, \n :small_orange_diamond: `!hw --rm 'id'` pour supprimer un devoir."

    switch (reason) {
        case "activity":
            text += "** Comment utiliser `!activity` : **"
            text += "\n :small_orange_diamond: `!activity --show_history 'number'` - vous raconter mes *number* dernières activités, "
            text += "\n :small_orange_diamond: `!activity --set 'activity'` - me faire faire *activity*."
            break

        case "hwDate":
            text += "Il semblerait que la date ne soit pas au bon format. Il faut l'entrer au format `jj/mm/aa` ou `jj/mm/aaaa`\n"
            text += hwText
            break

        case "hwArgs":
            text += "Woops, il semblerait qu'il n'y ait pas le bon nombre d'arguments.\n"
            text += hwText
            break

        case "hw":
            text += hwText
            break

        case "int":
            text += "** Comment utiliser `!int` : **"
            text += "\n :small_orange_diamond: `!int --add '@person' true 'number>0'` pour ajouter *number* points de int justifiés à *@person*"
            text += "\n :small_orange_diamond: `!int --add '@person' false 'number>0'` pour ajouter *number* points de int non justifiés à *@person*"
            text += "\n :small_orange_diamond: `!int --remove '@person' true 'number>0'` pour retirer *number* points de int justifiés à *@person*"
            text += "\n :small_orange_diamond: `!int --remove '@person' false 'number>0'` pour retirer *number* points de int non justifiés à *@person*"
            text += "\n :small_orange_diamond: `!int --show [--justified/--unjustified]` pour afficher le classement global/justifié/non justifié"
            break

        case "teams":
            text += "** Comment utiliser `!teams` : **"
            text += "\n :small_orange_diamond: `!teams 'number' '@role'` pour faire des équipes avec les membres d'un rôle."
            break

        case "general":
        default:
            text += "** Commandes disponibles : **"
            text += "\n :small_orange_diamond: `!help` pour afficher ce message,"
            text += "\n :small_orange_diamond: `ping` pour jouer au tennis de table "
            text += "\n :small_orange_diamond: `!activity [--show_history 'number'] / [--set 'activity']` pour gérer mon activité,"
            text += "\n :small_orange_diamond: `!teams ['number'] ['@role']` pour faire des équipes avec les membres d'un rôle, "
            text += "\n :small_orange_diamond: `!int --add/--rm/--show ['@role'] [true/false] ['number']` pour gérer les points de int. "
    }

    recipient.send(text)
}

/**
 * Tell the discord bot activity history
 * @param {Message} msg
 * @param {Client} dbClient
 * @param {int} number the number of activities you want to show
 */
exports.activity_showHistory = function (msg, dbClient, number) {
    dbClient.query("SELECT * FROM bot_activity ORDER BY act_id DESC", (err, result) => {
        if (err) throw err

        if (result.rows === undefined || result.rows.length == 0) {
            msg.channel.send("J'ai oublié tout ce que j'ai fait récemment... :sweat_smile:")
            return
        }

        var passedActivities = Array.from(result.rows, x => x.act_label)
        var text = ":relaxed: J'aime me souvenir ce que j'ai fait récemment : "
        for (var i = 0; i < number && i < passedActivities.length; i++) {
            text += "\n- " + passedActivities[i]
        }
        msg.channel.send(text)
    })
}

/**
 * Set the discord bot activity
 * @param {Message} msg
 * @param {Discord.Client} bot
 * @param {Client} dbClient
 * @param {String} new_activity 
 */
exports.activity_set = function (msg, bot, dbClient, newActivity) {

    if (newActivity.length > 128) {
        msg.reply(":vs: Désolé, mais cette activité est trop longue, je ne peux effectuer que des activités de moins de 128 caractères. ")
        return
    }
    if (newActivity == "") {
        bot.user.setActivity()
        msg.channel.send("J'arrête toute activité et à partir de maintenant, je m'ennuie. Merci _" + msg.author.username + "_ :sob: ")
    } else {
        bot.user.setActivity(newActivity)
        msg.channel.send("Je suis maintenant en train de **" + newActivity + "** sur ordre de _" + msg.author.username + "_. :sunny: ")
    }

    db.activity_push(dbClient, newActivity)
}

/**
 * Randomize teams with the members of a discord role
 * 
 * @param {Message} msg
 * @param {int} numberPerTeam
 * @param {Role} role
 */
exports.teams_make = function (msg, numberPerTeam, role) {
    if (isNaN(numberPerTeam) || numberPerTeam < 2) {
        msg.author.send(":vs: Tu crois vraiment qu'on va faire des équipes avec *" + numberPerTeam + "* personne dans chaque ? :P ")
        return
    }

    numberPerTeam = parseInt(numberPerTeam)
    var members = role.members.map(m => m.displayName)

    if (members.length <= numberPerTeam) {
        msg.channel.send(":vs: Il y a moins de gens qui ont ce rôle que de personnes par équipe, donc ... tout le monde ensemble ! :confetti_ball: ")
        return
    }

    // Randomization
    var isPerfect = (members.length % numberPerTeam) == 0
    var teams = []
    var team_number = 0
    teams[0] = []

    while (members.length > 0) {
        if (teams[team_number].length >= numberPerTeam) {
            team_number++
            teams[team_number] = []
        }
        let randomNumber = parseInt(Math.random() * members.length)

        teams[team_number].push(members[randomNumber])

        members.splice(randomNumber, 1)
    }

    var teamsText = ":white_check_mark: J'ai constitué des groupes de " + numberPerTeam + " avec le rôle <@&" + role.id + ">"
    if (!isPerfect) {
        teamsText += " (mais désolé, pas toutes égales, j'ai fait au mieux...) "

        if (teams[team_number].length == 1) {
            let randomNumber = parseInt(Math.random() * (teams.length - 1))
            teams[randomNumber].push(teams[team_number][0])
            teams.splice(team_number, 1)
            teamsText += "(et au moins le dernier n'est pas tout seul)"
        }
    }
    for (let i = 0; i < teams.length; i++) {
        teamsText += "\n :diamond_shape_with_a_dot_inside:  Équipe " + (i + 1) + " : "
        for (let j = 0; j < teams[i].length; j++) {
            teamsText += "\n		:white_medium_small_square:  " + teams[i][j]
        }
    }

    msg.channel.send(teamsText)
}

/**
 * Add homework
 * 
 * @param {Message} msg
 * @param {Client} dbClient
 * @param {Homework} homework
 * @param {int} date
 * @param {string} subject
 * @param {string} label
 */
exports.hwadd = function (msg, dbClient, hw) {
    switch (hw.type) {
        case "hw":
            hw.type = 1
            break

        case "ds":
            hw.type = 2
            break

        case "project":
            hw.type = 3
            break

        default:
            hw.type = 0
    }

    db.hw_push(dbClient, hw.type, hw.subject, hw.date, hw.label)
    msg.reply("J'ai bien ajouté à ma base de données : " + functions.homework2string(hw))
}

/**
 * Clean the table by deleting the old homeworks
 * 
 * @param {Message} msg
 * @param {Client} dbClient
 */
exports.hwclean = function (msg, dbClient) {
    var deletedElementsNumber = 0;

    var sqlQuery = "SELECT COUNT(id) AS number FROM homework WHERE date < NOW()::DATE";
    dbClient.query(sqlQuery, (err, result) => {
        if (err) {
            functions.replyToMessage(msg, ":x: Impossible de nettoyer ma mémoire, merci de vérifier mon code :thinking: ");
            throw err;
        } else {
            deletedElementsNumber = result.rows[0].number;

            if (deletedElementsNumber > 0) {
                var sqlQuery = "DELETE FROM homework WHERE date < NOW()::DATE";
                dbClient.query(sqlQuery, (err, result) => {
                    if (err) throw err;
                });
            }

            switch (deletedElementsNumber) { // Send a message with the number of deleted homeworks
                case "0":
                    functions.replyToMessage(msg, ":ballot_box_with_check: Pas d'ancien devoir à supprimer mais merci de vous soucier de ma mémoire :smile: ");
                    break;

                case "1":
                    functions.replyToMessage(msg, ":ballot_box_with_check: J'ai bien supprimé un ancien devoir. ");
                    break;

                default:
                    functions.replyToMessage(msg, ":ballot_box_with_check: J'ai bien supprimé " + deletedElementsNumber + " vieux devoirs. ");
            }
        }
    });
}

/**
 * Delete a homework from the table
 * 
 * @param {Message} msg
 * @param {Client} dbClient
 * @param {int} hwId
 */
exports.hwdelete = function (msg, dbClient, hwId) {
    var deletedHomework;
    if (isNaN(hwId)) {
        functions.replyToMessage(msg, ":vs: Aucun indice n'a été rentré ");
        return;
    }

    var sqlQuery = { // Get the homework that will be deleted
        text: "SELECT hom_id AS id, hom_type AS type, TO_CHAR(hom_date, 'yyyymmdd') AS date, hom_subject AS subject, hom_label AS label FROM homework WHERE hom_id = $1",
        values: [hwId],
    }

    dbClient.query(sqlQuery, (err, result) => {
        if (err) {
            console.log(err.stack);
            msg.reply(":x: Impossible de supprimer ce devoir, il semble ne pas exister")
        } else {
            deletedHomework = result.rows[0];

            if (deletedHomework != undefined) {
                // Delete the homework if it exists
                sqlQuery = {
                    text: 'DELETE FROM homework WHERE hom_id = $1',
                    values: [hwId],
                }
                dbClient.query(sqlQuery, (err, result) => {
                    if (err) throw err;
                });

                msg.reply(":zipper_mouth: Sur ordre de " + msg.author.username + ", j'ai bien supprimé le devoir : " + functions.homework2string(deletedHomework) + " ");
            } else {
                msg.reply(":vs: L'indice entré ne correspond à aucun devoir enregistré. ");
            }
        }
    });
}

/**
 * Display the homeworks to do
 * 
 * @param {Message} msg
 * @param {Client} dbClient
 * @param {boolean} showIDs true to show the homework ids
 * @param {int} whichOnes
 */
exports.hwshow = function (msg, dbClient, showIDs, whichOnes) {
    var homeworksText = ""

    //Query the database
    var sqlQuery = "SELECT hom_id AS id, hom_type AS type, TO_CHAR(hom_date, 'yyyymmdd') AS date, hom_subject AS subject, hom_label AS label FROM homework WHERE hom_date >= NOW()::DATE ORDER BY hom_type, hom_date, hom_subject"

    if (whichOnes == 1 || whichOnes == 2 || whichOnes == 3) {
        sqlQuery = "SELECT hom_id AS id, hom_type AS type, TO_CHAR(hom_date, 'yyyymmdd') AS date, hom_subject AS subject, hom_label AS label FROM homework WHERE hom_date >= NOW()::DATE AND hom_type = " + whichOnes + " ORDER BY hom_type, hom_date, hom_subject"
    }

    dbClient.query(sqlQuery, (err, res) => {
        if (err) throw err

        // Construct the message
        if (res.rowCount == 0) {
            switch (whichOnes) {
                case 1:
                    homeworksText = "Aucun exercice prévu, plutôt cool non ? :happy: "
                    break
                case 2:
                    homeworksText = "Pas de DS de prévu, mais ce n'est qu'une question de temps :watch: "
                    break
                case 3:
                    homeworksText = "Pour l'instant, aucun project à l'horizon :partying_face: "
                    break
                default:
                    homeworksText = "Étrange... Pas de devoirs :thinking: "
            }
        } else {
            switch (whichOnes) {
                case 1:
                    homeworksText = ":blue_book: Voici les exercices à faire, bon courage : "
                    break
                case 2:
                    homeworksText = ":blue_book: Oula, va falloir réviser : "
                    break
                case 3:
                    homeworksText = ":blue_book: *Project time !* : "
                    break
                default:
                    homeworksText = ":blue_book: Voici tout ce qu'il y a à faire, bon courage : "
            }

            for (var i = 0; i < res.rowCount; i++) {
                let text = functions.homework2string(res.rows[i])

                // Add the IDs
                if (showIDs) {
                    text += " (" + res.rows[i].id + ") "
                }

                homeworksText += "\n" + text
            }
        }
        msg.reply(homeworksText)
    });
}

/**
 * Add int points to the user
 * @param {Message} msg
 * @param {Client} dbClient
 * @param {User} user
 * @param {int} points
 * @param {boolean} isJustified
 */
exports.intadd = function (msg, dbClient, user, points, isJustified) {
    db.intpoints_add(dbClient, user, points, isJustified)

    var replyString = "";
    if (points > 0) {
        replyString += "J'ai bien rajouté " + points
    } else {
        replyString += "J'ai bien retiré " + (-points)
    }
    replyString += " point";
    if (points != 0 && points != 1 && points != -1) {
        replyString += "s"
    }
    if (!isJustified) {
        replyString += " non"
    }
    replyString += " justifié"
    if (points != 0 && points != 1 && points != -1) {
        replyString += "s"
    }
    replyString += " de int à *" + user.displayName + "* sur ordre de _" + msg.author.username + "_."

    msg.channel.send(replyString)
}

/**
 * Display the global 'int' points classment 
 * @param {Message} msg
 * @param {Client} dbClient
 */
exports.intshowAll = function (msg, dbClient) {
    var sqlQuery = "SELECT * FROM int_points ORDER BY int_justified_points+int_unjustified_points DESC"

    dbClient.query(sqlQuery, (err, result) => {
        if (err) throw err

        if (result.rowCount == 0) {
            msg.channel.send("Rien à afficher. Vous êtes tous des élèves sages. :scream: ")
            return
        }

        var text = ":trophy: Et voici le classement **global** des points de int : "
        var i = 0
        while (i < result.rowCount) {
            var classment = i + 1
            do {
                var member = msg.guild.members.find(x => x.user.id == result.rows[i].int_player_id)
                if (member == undefined) {
                    member = "_(a quitté le serveur)_"
                } else {
                    member = member.displayName
                }
                var points = result.rows[i].int_justified_points + result.rows[i].int_unjustified_points

                text += "\n#" + classment + " : " + member + " _(" + points + " point"
                if (points != 0 && points != 1 && points != -1) {
                    text += "s"
                }
                text += ")_"
                i++
            } while (i < result.rows.length && result.rows[i - 1].int_justified_points + result.rows[i - 1].int_unjustified_points == result.rows[i].int_justified_points + result.rows[i].int_unjustified_points)
        }

        msg.channel.send(text)
    })
}

/**
 * Display the justified 'int' points classment 
 * @param {Message} msg
 * @param {Client} dbClient
 */
exports.intshowJustified = function (msg, dbClient) {
    var sqlQuery = "SELECT * FROM int_points ORDER BY int_justified_points DESC"

    dbClient.query(sqlQuery, (err, result) => {
        if (err) throw err

        if (result.rowCount == 0) {
            msg.channel.send("Rien à afficher. Vous êtes tous des élèves sages. :scream: ")
            return
        }

        var text = ":trophy: Et voici le classement des points de int **justifiés** : "
        var i = 0
        while (i < result.rowCount) {
            var classment = i + 1
            do {
                var member = msg.guild.members.find(x => x.user.id == result.rows[i].int_player_id)
                if (member == undefined) {
                    member = "_(a quitté le serveur)_"
                } else {
                    member = member.displayName
                }
                text += "\n#" + classment + " : " + member + " _(" + result.rows[i].int_justified_points + " point"
                if (result.rows[i].int_justified_points != 0 && result.rows[i].int_justified_points != 1 && result.rows[i].int_justified_points != -1) {
                    text += "s"
                }
                text += ")_"
                i++
            } while (i < result.rows.length && result.rows[i - 1].int_justified_points == result.rows[i].int_justified_points)
        }

        msg.channel.send(text)
    })
}

/**
 * Display the unjustified 'int' points classment 
 * @param {Message} msg
 * @param {Client} dbClient
 */
exports.intshowUnjustified = function (msg, dbClient) {
    var sqlQuery = "SELECT * FROM int_points ORDER BY int_unjustified_points DESC"

    dbClient.query(sqlQuery, (err, result) => {
        if (err) throw err

        if (result.rowCount == 0) {
            msg.channel.send("Rien à afficher. Vous êtes tous des élèves sages. :scream: ")
            return
        }

        var text = ":trophy: Et voici le classement des points de int **non justifiés** : "
        var i = 0
        while (i < result.rowCount) {
            var classment = i + 1
            do {
                var member = msg.guild.members.find(x => x.user.id == result.rows[i].int_player_id)
                if (member == undefined) {
                    member = "_(a quitté le serveur)_"
                } else {
                    member = member.displayName
                }
                text += "\n#" + classment + " : " + member + " _(" + result.rows[i].int_unjustified_points + " point"
                if (result.rows[i].int_unjustified_points != 0 && result.rows[i].int_unjustified_points != 1 && result.rows[i].int_unjustified_points != -1) {
                    text += "s"
                }
                text += ")_"
                i++
            } while (i < result.rows.length && result.rows[i - 1].int_unjustified_points == result.rows[i].int_unjustified_points)
        }

        msg.channel.send(text)
    })
}