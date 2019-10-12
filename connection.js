/**
 * Create a db client
 * 
 * @return {Client} a postgresql db client
 */
exports.createDbClient = function () {
    // Load the database library
    const { Client } = require('pg');

    return new Client({
        connectionString: process.env.DATABASE_URL,
        port: 5432,
        ssl: true
    });
}

/**
 * Get the bot id token
 * 
 * @return {string} 
 */
exports.getIdToken = function () {
    return process.env.BOT_TOKEN
}

/**
 * Get the last bot activity stored in the database
 * 
 * @return {string}
 */
exports.getLastActivity = function (dbClient) {
    var sqlQuery = "SELECT * FROM activity ORDER BY id DESC";
    dbClient.query(sqlQuery, (err, result) => {
        if (err) throw err;

        if (result.rows[0] != undefined) {
            return result.rows[0].label;
        }
    });
    return "";
}