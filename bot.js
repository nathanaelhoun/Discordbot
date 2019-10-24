/**
 * Abdessamad, the gentle discord bot
 * Created to interact in discord class groups.
 * 
 * @version 2.0
 * @author Nathanaël Houn
 * @author Promo 2018 des CMI Informatique de Besançon
 */

require("dotenv").config();
const fs = require('fs')
const Discord = require('discord.js')
const dbPostGresql = require('pg')

const client = new Discord.Client()
const dbClient = new dbPostGresql.Client({
    connectionString: process.env.DATABASE_URL,
    port: 5432,
    ssl: true
})

fs.readdir('./events/', (err, files) => {
    files.forEach(file => {
        const eventHandler = require(`./events/${file}`)
        const eventName = file.split('.')[0]
        client.on(eventName, (...args) => eventHandler(client, dbClient, ...args))
    })
})

client.login(process.env.BOT_TOKEN)