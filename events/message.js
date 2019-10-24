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
                msg.delete()
                if (options.length != 1) {
                    msg.reply(":vs: Cette fonction nécessite une option. ")
                    break
                }

                if (options[0] == 'show_history') {
                    if (typeof (args[0]) != "string") {
                        msg.reply(":vs: Il faut me dire combien d'activités je suis censé me rappeler !")
                        break
                    }
                    features.activity_showHistory(msg, dbClient, parseInt(args[0]))
                    break
                }

                if (options[0] == 'set') {
                    features.activity_set(msg, client, dbClient, args.join(' '))
                }

            default:
        }
    }
}