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
        text += "Je n'ai pas compris ce que tu as voulu dire... Vérifie ça :wink: \n"
    }

    switch (reason) {
        case "activity":
            text += "** Comment utiliser `!activity` : **"
            text += "\n :small_orange_diamond: `!activity --show_history 'number'` - vous raconter mes *number* dernières activités, "
            text += "\n :small_orange_diamond: `!activity --set 'activity'` - me faire faire *activity*."
            break

        case "teams":
            text += "** Comment utiliser `!teams` : **"
            text += "\n :small_orange_diamond: `!teams ['number'] ['@role']` pour faire des équipes avec les membres d'un rôle."
            break

        case "general":
        default:
            text += "** Commandes disponibles : **"
            text += "\n :small_orange_diamond: `!help` pour afficher ce message,"
            text += "\n :small_orange_diamond: `ping` pour jouer au tennis de table "
            text += "\n :small_orange_diamond: `!activity [--show_history 'number'] / [--set 'activity']` pour gérer mon activité,"
            text += " \n :small_orange_diamond: `!teams ['number'] ['@role']` pour faire des équipes avec les membres d'un rôle. "
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