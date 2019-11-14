/**
 * Abdessamad, the gentle discord bot
 * Created to interact in discord class groups.
 * 
 * @version 2.0
 * @author Nathanaël Houn
 * @author Promo 2018 des CMI Informatique de Besançon
 */

/**
 * Export the first word in lowercase of a string without its prefix
 * @param {Message} message
 * @return {String}
 */
exports.getCommandFrom = function (message) {
    return message.content.substring(1).split(' ')[0].toLowerCase()
}

/**
 * Exports all the words in lowercase with a '--' prefix into an array
 * @param {Message} message
 * @return {Array}
 */
exports.getOptionsFrom = function (message) {
    var options = []
    message.content.substring(1).split(' ').forEach(word => {
        if (word.substring(0, 2) == "--") {
            options.push(word.substring(2).toLowerCase())
        }
    })
    return options
}

/**
 * Exports all the word without prefix into an array
 * @param {Message} message
 * @return {Array}
 */
exports.getArgsFrom = function (message) {
    var args = []
    message.content.split(' ').forEach(word => {
        if (word.substring(0, 1) != "-" && word.substring(0, 1) != '!') {
            args.push(word)
        }
    })
    return args
}

/**
 * Convert a yyyymmdd date into a "dd/mm/yy" date 
 * @param {int} dateInt
 * @return {string} the date
 */
exports.date2string = function (dateInt) {
    let year = Math.floor(dateInt / 10000)
    dateInt = dateInt % 10000
    let month = Math.floor((dateInt) / 100)
    dateInt = dateInt % 100
    let day = Math.floor(dateInt)
    return day + "/" + month + "/" + year
}

/**
 * Checks that an yyyymmdd date is correct
 * 
 * @param {int} dateInt the date to check
 * @return {boolean} true if it is correct, false otherwise
 */
exports.isDateCorrect = function (dateInt) {
    let year = Math.floor(dateInt / 10000)
    dateInt = dateInt % 10000
    let month = Math.floor((dateInt) / 100)
    dateInt = dateInt % 100
    let day = Math.floor(dateInt)

    if (month > 13 || month < 0) {
        return false
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
                return false
            }
            break

        case 2:
            if (day > 29 || day < 0) {
                return false
            }
            break

        default:
            if (day > 30 || day < 0) {
                return false
            }
    }
    return true
}

/**
 * Convert a "dd/mm/yy" date in yyyymmdd date
 * @param {string} dateString
 * @return {string} the date
 */
exports.string2date = function (dateString) {
    let day = dateString.substring(0, 2)
    let month = dateString.substring(3, 5)
    let year = dateString.substring(6, 8)
    let year2 = dateString.substring(8, 10)
    if (year2 != "") {
        year = year + year2
    } else {
        year = "20" + year
    }
    return year + month + day
}

/**
 * Get a string with a good presentation from an homework object
 * @param {Homework} hw 
 * @return {string}
 */
exports.homework2string = function (hw) {
    let type = "";
    switch (hw.type) {
        case 1:
            type = "Exo"
            break
            "project"
        case 2:
            type = "DS"
            break

        case 3:
            type = "Projet"
            break

        default:
            type = "???"
    }

    let dateInt = hw.date
    let year = Math.floor(dateInt / 10000)
    dateInt = dateInt % 10000
    let month = Math.floor((dateInt) / 100)
    dateInt = dateInt % 100
    let day = Math.floor(dateInt)

    return (type + " - " + day + "/" + month + "/" + year + " - **" + hw.subject + "** -  " + hw.label + " ")
}

