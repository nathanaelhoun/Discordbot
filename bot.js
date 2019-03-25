// Abdessamad discord bot
// Created by Nathanaëlhoun and supported by his wonderful classmates

// Load the discord.js library
const Discord = require('discord.js');

// Load the fs filesystem library
const fs = require('fs');

// Load the configs
const auth = require("./auth.json");
let configraw = fs.readFileSync("./config.json");
var config = JSON.parse(configraw);

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
	bot.user.setActivity(config.activity);
	console.log("Activité actuelle : "+config.activity);
});

// Message
bot.on('message' , msg => {

	// Commands beginning with an '!'
	if(msg.content.substring(0,1) === '!'){

		//Split the message
		var text = msg.content.substring(1).split(' ');

		//Get the command in lowercase
		var command = text[0];
		command = command.toLowerCase();

		//Get the arguments of the command
		if(text.length>1){
			var arguments = []
			for(var i=1 ; i<text.length ; i++){
				arguments[i-1] = text[i];
			}
		}

		//Detect the command and execute it
		switch(command){

			//help
			case 'help' :
				deleteMsg(msg);
				sendMessage(msg,"Il n'y a aucune fonction intégrée pour l'instant...");
			break;

			case 'ping' :
				sendMessage(msg,"Pong !");
			break;

			case 'setactivity' :
				// Get the new activity
				let newActivity = { 
					"activity":""
					};

				for (var i = 0; i < arguments.length; i++) {
                    newActivity.activity += arguments[i] + ' ';
				}
				
				// Set and save the new activity in config.json
				fs.writeFileSync("./config.json",JSON.stringify(newActivity));
				bot.user.setActivity(newActivity.activity);
				sendMessage(msg,"Je suis maintenant en train de jouer à **"+newActivity.activity+"** sur ordre de _"+msg.author.username+"_. ");
			break;
		}
	}
});

//Use the token
bot.login(auth.token);