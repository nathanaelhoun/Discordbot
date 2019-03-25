// Abdessamad discord bot
// Created by Nathanaëlhoun and supported by his wonderful classmates

// Load the discord.js library
const Discord = require('discord.js');

// Load the fs filesystem library
const fs = require('fs');

// Load the configs
const auth = require("./auth.json");
let activityraw = fs.readFileSync("./activity.json");
var activityfile = JSON.parse(activityraw);

// ## Functions
	// Delete the command message
	//@message the message to delete
function deleteMessage(message){
    message.delete();
    console.log('Deleted message from ',message.author.username);
}

	// Send a message
	//@message the message to answer
	//@text Text message to send       
function sendMessage(message,text){
    message.channel.send(text);
    console.log('Sent the message:',text);
}


// Create the client
const bot = new Discord.Client();

// Launch the client
bot.on('ready', () => {
	console.log("Je suis vivant !");
	bot.user.setActivity(activityfile.activity);
	console.log("Activité actuelle : "+activityfile.activity);
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
		var arguments = []
		if(text.length>1){
			for(var i=1 ; i<text.length ; i++){
				arguments[i-1] = text[i];
			}
		}

		//Detect the command and execute it
		switch(command){

			//help
			case 'help' :
				deleteMessage(msg);
				//Define the !help text
				var helpText = "# Commandes actuelles : \n * !help pour obtenir de l'aide, \n * !ping pour jouer au tennis de table, \n * !setactivity [+texte] pour choisir l'activité du bot. ";
				sendMessage(msg,helpText);
			break;

			case 'ping' :
				sendMessage(msg,"Pong !");
			break;

			case 'setactivity' :
				// Get the new activity
				let newActivityfile = { 
					"activity":""
				};
				
				deleteMessage(msg);
				//if there is a new activity
				if(arguments.length!=0){
					for (var i = 0; i < arguments.length; i++) {
						newActivityfile.activity += arguments[i] + ' ';
					}
					sendMessage(msg,"Je suis maintenant en train de jouer à **"+newActivityfile.activity+"** sur ordre de _"+msg.author.username+"_. ");
				} else {
				//if there is no new activity
					sendMessage(msg,"J'arrête toute activité et à partir de maintenant, je m'ennuie. Merci _"+msg.author.username+"_. ");
					bot.user.setActivity();
				}

				// Set and save the new activity in config.json
				fs.writeFileSync("./activity.json",JSON.stringify(newActivityfile));
				bot.user.setActivity(newActivityfile.activity);
			break;
			
			default :
				deleteMessage(msg);
				sendMessage(msg,"Hum, la commande "+command+" n'est pas reconnue. Essayez '!help' pour voir ?");
			break;
		}
	}
});

//Use the token (Heroku or local)
//bot.login(process.env.BOT_TOKEN);
bot.login(auth.token);