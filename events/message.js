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

module.exports = (client, dbClient, message) => {

    if (message.content == "ping") {
        return features.ping(message)
    }

    if (message.content.startsWith("!")) {
        var command = functions.getCommandFrom(message)
        var options = functions.getOptionsFrom(message)
        var args = functions.getArgsFrom(message)

        console.log("Command :" + command)
        console.log("Options :" + options)
        console.log("Arguments :" + args)
    }
}