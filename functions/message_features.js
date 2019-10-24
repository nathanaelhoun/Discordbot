/**
 * Abdessamad, the gentle discord bot
 * Created to interact in discord class groups.
 * 
 * @version 2.0
 * @author Nathanaël Houn
 * @author Promo 2018 des CMI Informatique de Besançon
 */

/**
 * Answer "pong" to "ping"
 * @param {Message} message
 */
exports.ping = function (message) {
    message.channel.send("Pong :baseball:")
}

/**
 * Set the discord bot activity
 * @param {Message} msg
 * @param {Discord.Client} bot
 * @param {Client} dbClient
 */
exports.setactivity = function (msg, bot, dbClient, arguments) {
    var newActivity = arguments.join(" ");


    // If the string is too long (over 128 char)
    if (newActivity.length > 128) {
        functions.replyToMessage(msg, ":vs: Désolé, mais cette activité est trop longue, je ne peux effectuer que des activités de moins de 128 caractères. ");

    } else if (newActivity == "") {
        bot.user.setActivity();
        functions.replyToMessage(msg, "J'arrête toute activité et à partir de maintenant, je m'ennuie. Merci _" + msg.author.username + "_ :sob: ");

    } else {
        bot.user.setActivity(newActivity);
        functions.replyToMessage(msg, "Je suis maintenant en train de **" + newActivity + "** sur ordre de _" + msg.author.username + "_. :sunny: ");

        var sqlQuery = {
            text: 'INSERT INTO activity(label) VALUES ($1)',
            values: [newActivity],
        }
        dbClient.query(sqlQuery, (err, res) => {
            if (err) throw err;
        });
    }
}
