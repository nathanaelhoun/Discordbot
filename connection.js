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
    return process.env.BOT_TOKEN;
}