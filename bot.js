// Abdessamad discord bot
// Created by Nathanaëlhoun and supported by his wonderful classmates

// Load the discord.js library
const Discord = require('discord.js');

// Load the fs filesystem library
const fs = require('fs');

// Load the database library and create the client
// Using the Heroku PostGres database
const { Client } = require('pg');

const client = new Client({
	connectionString: process.env.DATABASE_URL,
	ssl: true,
});

client.connect();

client.query('SELECT table_schema,table_name FROM information_schema.tables;', (err, res) => {
	if (err) throw err;
	for (let row of res.rows) {
		console.log(JSON.stringify(row));
	}
});

client.query('SELECT * FROM homework;', (err, homeworkRaw) => {
	if (err) throw err;
	for (let row of homeworkRaw.rows) {
		console.log(JSON.stringify(row));
		var homework = JSON.stringify(row);
		homeworksText += "\n* " + homework2string(homework);
	}
});

// Load the configs
let activityraw = fs.readFileSync("./activity.json");
var activityfile = JSON.parse(activityraw);
let homeworksRaw = fs.readFileSync("./homeworks.json");
var homeworks = JSON.parse(homeworksRaw);

// What is today's date ?
var now = new Date();
var today = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();

// ------------------------
// 		Functions
// ------------------------

// Delete the command message
//@message the message to delete
function deleteMessage(message) {
	message.delete();
	console.log('Deleted message from ', message.author.username);
}

// Send a message
//@message the message to answer
//@text Text message to send       
function sendMessage(message, text) {
	message.channel.send(text);
	console.log('Sent the message:', text);
}

// Get a string of the date in dd/mm/yyyy from an in yyyymmdd
function dateIntToString(dateInt) {
	let year = Math.floor(dateInt / 10000);
	dateInt = dateInt % 10000
	let month = Math.floor((dateInt) / 100);
	dateInt = dateInt % 100;
	let day = Math.floor(dateInt);

	//Add '0' to improve the reading
	if (month < 10) {
		month = '0' + month;
	}
	if (day < 10) {
		day = '0' + day;
	}
	return (day + "/" + month + "/" + year);
}

// Check that an yyyymmdd date is correct
function isDateCorrect(dateInt) {
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

// Get a string with good presentation from an homework object
function homework2string(homework) {
	return (dateIntToString(homework.date) + " - **" + homework.subject + "** -  " + homework.description + " ");
}
// ------------------------
// 	Launching the bot
// ------------------------


// Create the client
const bot = new Discord.Client();

// Launch the client
bot.on('ready', () => {
	console.log("Je suis vivant !");
	bot.user.setActivity(activityfile.activity);
	console.log("Activité actuelle : " + activityfile.activity);
	now = new Date();
	today = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
});


// ------------------------
// 	When a message is sent
// ------------------------
bot.on('message', msg => {
	homeworksRaw = fs.readFileSync("./homeworks.json");
	homeworks = JSON.parse(homeworksRaw);

	// Commands beginning with an '!'
	if (msg.content.substring(0, 1) === '!') {

		//Split the message
		var text = msg.content.substring(1).split(' ');

		//Get the command in lowercase
		var command = text[0];
		command = command.toLowerCase();

		//Get the arguments of the command
		var arguments = []
		if (text.length > 1) {
			for (var i = 1; i < text.length; i++) {
				arguments[i - 1] = text[i];
			}
		}

		//Detect the command and execute it
		switch (command) {

			//help
			case 'help':
				deleteMessage(msg);
				//Define the !help text
				var helpText = "# Commandes actuelles : \n * !help pour obtenir de l'aide, \n * !ping pour jouer au tennis de table, \n * !setActivity [+texte] pour choisir l'activité du bot, \n * !hwShow pour montrer les devoirs à faire, \n * !hwClean pour supprimer les anciens devoirs, \n * !hwAdd [aaaammjj] [matière] [libellé] pour ajouter une date, \n * !hwDel [indice] pour supprimer un devoir (attention 1er indice = 0). \n Vous pouvez afficher/ajouter des devoirs depuis une convo privée avec moi ! ";
				sendMessage(msg, helpText);
				break;

			case 'ping':
				sendMessage(msg, "Pong !");
				break;

			case 'setactivity':
				// Get the new activity
				let newActivityfile = {
					"activity": ""
				};

				deleteMessage(msg);
				//if there is a new activity
				if (arguments.length != 0) {
					for (var i = 0; i < arguments.length; i++) {
						newActivityfile.activity += arguments[i] + ' ';
					}
					sendMessage(msg, "Je suis maintenant en train de jouer à **" + newActivityfile.activity + "** sur ordre de _" + msg.author.username + "_. ");
				} else {
					//if there is no new activity
					sendMessage(msg, "J'arrête toute activité et à partir de maintenant, je m'ennuie. Merci _" + msg.author.username + "_. ");
					bot.user.setActivity();
				}

				// Set and save the new activity in config.json
				fs.writeFileSync("./activity.json", JSON.stringify(newActivityfile));
				bot.user.setActivity(newActivityfile.activity);
				break;

			// Show the homeworks
			case 'hwshow':
				deleteMessage(msg);
				var homeworksText = "";

				//Query the database
				client.connect();

				client.query('SELECT * FROM homework;', (err, homeworkRaw) => {
					if (err) throw err;
					for (let row of homeworkRaw.rows) {
						console.log(JSON.stringify(row));
						var homework = JSON.stringify(row);
						homeworksText += "\n* " + homework2string(homework);
					}
				});


				if (homeworksText == "") {
					homeworksText = "Étrange... Pas de devoirs :thinking: ";
				} else {
					homeworksText = ":blue_book: Voici les devoirs à faire, bon courage : " + homeworksText;
				}

				sendMessage(msg, homeworksText);
				break;

			// Delete old homework
			case 'hwclean':
				deleteMessage(msg);
				var nbElementSupprimes = 0;
				var i = 0;
				while (i < homeworks.data.length) {
					if (homeworks.data[i].date < today) {
						homeworks.data.splice(i, i + 1);
						nbElementSupprimes++;
					}
					i++;
				}

				switch (nbElementSupprimes) {
					case 0:
						sendMessage(msg, ":white_check_mark: Pas d'ancien devoir à supprimer mais merci de vous soucier de ma mémoire :smile: ");
						break;

					case 1:
						sendMessage(msg, ":white_check_mark: J'ai bien supprimé un ancien devoir. ");
						break;

					default:
						sendMessage(msg, ":white_check_mark: J'ai bien supprimé " + nbElementSupprimes + " vieux devoirs. ");
				}
				fs.writeFileSync("./homeworks.json", JSON.stringify(homeworks, null, 2));
				break;


			//Add new homework
			case 'hwadd':
				deleteMessage(msg);

				var date = arguments[0];
				var subject = arguments[1];
				var description = "";
				for (var i = 2; i < arguments.length; i++) {
					description += arguments[i] + " ";
				}

				if (date < today) {
					sendMessage(msg, ":vs: Déso pas déso, la date que tu as entrée est déjà passée. Il faut la rentrer au format aaaammjj");
				} else if (!isDateCorrect(date)) {
					sendMessage(msg, ":vs: Déso pas déso, la date que tu as entrée n'est pas valide. Il faut la rentrer au format aaaammjj");
				} else if (subject == undefined) {
					sendMessage(msg, ":vs: Coco, t'as même pas mis de matière, comment je suis censé gérer ça moi ? ");
				} else if (description == "") {
					sendMessage(msg, ":vs:  Bon, s'il n'y a rien à faire en description, pas la peine de m'appeler hein ! ");
				} else {
					let indice = homeworks.data.length;
					homeworks.data[indice] = { "date": date, "subject": subject, "description": description };
					sendMessage(msg, ":white_check_mark: J'ai bien rajouté à ma liste : " + homework2string(homeworks.data[indice]));
				}
				fs.writeFileSync("./homeworks.json", JSON.stringify(homeworks, null, 2));

				break;


			//Delete an homework
			case 'hwdel':
				deleteMessage(msg);

				var indice = arguments[0];
				if (indice >= 0 && indice < homeworks.data.length) {
					var deletedHomework = homeworks.data[indice];
					homeworks.data.splice(indice, indice + 1);
					sendMessage(msg, ":x: Sur ordre de " + msg.author.username + ", j'ai bien supprimé le devoir : " + homework2string(deletedHomework) + " ");
					fs.writeFileSync("./homeworks.json", JSON.stringify(homeworks, null, 2));
				} else {
					sendMessage(msg, ":vs: L'indice entré ne correspond à aucun devoir enregistré. ");
				}
				break;


			// Command do not exist
			default:
				deleteMessage(msg);
				sendMessage(msg, "Hum, la commande " + command + " n'est pas reconnue. Essayez '!help' pour voir ?");
				break;
		}
	}
});


// ---------------------------------
//	Use the token (Heroku or local)
// ---------------------------------

bot.login(process.env.BOT_TOKEN);

//const auth = require("./auth.json");
//bot.login(auth.token);

client.end();