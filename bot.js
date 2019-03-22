// Abdessamad discord bot
// Created by Nathana�lhoun and supported by his wonderful classmates

// Load the discord.js library
const Discord = require('discord.js');

// Load the configs
const auth = require("./auth.json");


// ## Functions
	// Delete the command message
	// to put if the command has to be deleted
function deleteMessage(message){
    messsage.delete();
    console.log('Deleted message from ',message.author.username);
}

	// Send a message
	// @text Text message to send       
function sendMessage(message,text){
    message.channel.send(text);
    console.log('Sent the message:',text);
}


// Create the client
const bot = new Discord.Client();

// Launch the client
bot.on('ready', () => {
	console.log("Je suis vivant !");
bot.user.setActivity("réparer son intérieur.");
});

// Message
bot.on('message' , msg => {

	// Commands beginning with an '!'
	if(msg.content.substring(0,1) === '!'){

		//Split the message
		var text = msg.content.substring(1).split(' ');

		//Get the command in lowercase
		var cmd = text[0];
		cmd = cmd.toLowerCase();

		switch(cmd){

			//help
			case 'help' :
				deleteMsg(msg);
				sendMessage(msg,"Il n'y a aucune fonction intégrée pour l'instant...");
				break;

			case 'ping' :
				sendMessage(msg,"Pong !");
				break;
		}
	}
});

//Use the token
bot.login(auth.token);