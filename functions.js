/**
 * Delete a message and log it into the console
 * 
 * @param {Message} message 
 */
exports.deleteMessage = function (message) {
    console.log('Deleted message from ', message.author.username);
    message.delete();
}

/**
 * Reply to a message with a string text
 * 
 * @param {Message} message the message to answer
 * @param {string} text the text to send
 */
exports.replyToMessage = function (message, text) {
    message.channel.send(text);
    console.log('Sent the message:', text);
}

/**
 * Checks that an yyyymmdd date is correct
 * 
 * @param {int} dateInt the date to check
 * @return {boolean} true if it is correct, false otherwise
 */
exports.isDateCorrect = function (dateInt) {
    let year = Math.floor(dateInt / 10000);
    dateInt = dateInt % 10000
    let month = Math.floor((dateInt) / 100);
    dateInt = dateInt % 100;
    let day = Math.floor(dateInt);

    if (month > 13 || month < 0) {
        return (false);
    }
    switch (month) {
        case 1:
        case 3:
        case 5:
        case 7:
        case 8:
        case 10:
        case 12:
            if (day > 31 || day < 0) {
                return (false);
            }
            break;

        case 2:
            if (day > 29 || day < 0) {
                return (false);
            }
            break;

        default:
            if (day > 30 || day < 0) {
                return (false);
            }
    }
    return (true);
}

/**
 * Get a string with a good presentation from an homework object
 * 
 * @param {Homework} homework 
 * @return {string}
 */
exports.homework2string = function (homework) {
    return (homework.formateddate + " - **" + homework.subject + "** -  " + homework.description + " ");
}

/**
 * Hash a string into an integer
 * 
 * @param {string} str
 * @return {int}
 */
exports.hashCode = function (str) {
    if (typeof str != "string") {
        return 0;
    }

    var hash = 0;
    if (str.length == 0) return hash;
    for (i = 0; i < str.length; i++) {
        char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}