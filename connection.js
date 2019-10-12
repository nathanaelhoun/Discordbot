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
