
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
            args.push(word);
        }
    })
    return args
}