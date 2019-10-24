/**
 * Abdessamad, the gentle discord bot
 * Created to interact in discord class groups.
 * 
 * @version 2.0
 * @author Nathanaël Houn
 * @author Promo 2018 des CMI Informatique de Besançon
 */

const db = require('./database.js')

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
        text += "Oups, je ne comprends pas ce que tu as voulu dire... Vérifie ça ! \n"
    }

    switch (reason) {
        case "general":
            text += "** Commandes disponibles : **"
            text += "\n :small_orange_diamond: `!help` pour afficher ce message,"
            text += "\n :small_orange_diamond: `ping` pour jouer au tennis de table "
            text += "\n :small_orange_diamond: `!activity [--show_history 'number'] / [--set 'activity']` pour gérer mon activité."
            break

        case "activity":
            text += "** Comment utiliser `!activity` : **"
            text += "\n :small_orange_diamond: `!activity --show_history 'number'` - vous raconter mes *number* dernières activités, "
            text += "\n :small_orange_diamond: `!activity --set 'activity'` - me faire faire *activity*."
            break
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