/**
 * Abdessamad, the gentle discord bot
 * Created to interact in discord class groups.
 * 
 * @version 1.0
 * @author Nathanaël Houn
 * @author Promo 2018 des CMI Informatique de Besançon
 */

// Load functions
const functions = require('./functions.js');
const connection = require('./connection_local.js');
const abdessamad = require('./abdessamad_features.js');

// Load the discord.js library
const Discord = require('discord.js');

// ------------------------
// 	Launching the bot
// ------------------------

const bot = new Discord.Client();
const dbClient = connection.createDbClient();
bot.login(connection.getIdToken());

bot.on('ready', () => {
	console.log("Je suis vivant !");

	var activity = "";
	var sqlQuery = "SELECT * FROM activity ORDER BY id DESC";
	dbClient.query(sqlQuery, (err, result) => {
		if (err) throw err;

		if (result.rows[0] != undefined) {
			activity = result.rows[0].label;
			bot.user.setActivity(activity);
		}
		console.log("Activité actuelle : " + activity);
	})

	dbClient.connect((err) => {
		if (err) {
			console.error('Connection à la base de données échouée :-(', err.stack);
		} else {
			console.log('Connection à la base de données réussie ! ;-)');
		}
	});
});


// ------------------------
// 	When a message is sent
// ------------------------
bot.on('message', msg => {

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

		switch (functions.hashCode(command)) {

			case 3198785: // help
				abdessamad.help(msg);
				break;

			case 3441010: // ping
				functions.replyToMessage(msg, "Pong ! :baseball:");
				break;

			case 268709233: //setactivity
				functions.deleteMessage(msg);
				abdessamad.setactivity(msg, bot, dbClient)
				break;

			case 3343: // hw

				// Get the second command and lowerCase it
				var secondCommand = arguments[0];
				if (secondCommand == undefined) {
					secondCommand = "help";
				} else {
					secondCommand = secondCommand.toLowerCase();
				}

				switch (functions.hashCode(secondCommand)) {

					case functions.hashCode('show'): // Show the homeworks
						functions.deleteMessage(msg);
						abdessamad.hwshow(msg, dbClient, arguments[1] == "id");
						break;

					case functions.hashCode('clean'): // Delete old homework
						functions.deleteMessage(msg);
						abdessamad.hwclean(msg, dbClient);
						break;

					case functions.hashCode('add'): // Add new homework
						var date = arguments[1];
						var subject = arguments[2];
						var description = "";
						for (var i = 3; i < arguments.length; i++) {
							description += arguments[i] + " ";
						}

						var now = new Date();
						var today = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();

						if (date < today) {
							functions.replyToMessage(msg, ":vs: Déso pas déso, la date que tu as entrée est déjà passée. Il faut la rentrer au format aaaammjj");
						} else if (!functions.isDateCorrect(date) || date == undefined) {
							functions.replyToMessage(msg, ":vs: Déso pas déso, la date que tu as entrée n'est pas valide. Il faut la rentrer au format aaaammjj");
						} else if (subject == undefined) {
							functions.replyToMessage(msg, ":vs: Coco, t'as même pas mis de matière, comment je suis censé gérer ça moi ? ");
						} else if (description == "") {
							functions.replyToMessage(msg, ":vs:  Bon, s'il n'y a rien à faire en description, pas la peine de m'appeler hein ! ");
						} else {
							abdessamad.hwadd(msg, dbClient, date, subject, description);
						}
						break;

					case functions.hashCode('delete'): // Delete a precise homework
						functions.deleteMessage(msg);

						var id = arguments[1];
						abdessamad.hwdelete(msg, dbClient, id);
						break;

					case functions.hashCode('help'): // help
						var commandNotExists = false;

					default:
						var hwHelpText = "";
						if (typeof commandNotExists == 'undefined' || commandNotExists) {
							hwHelpText += "Cette commande n'est pas reconnue.\n";
						}
						hwHelpText += "Voici les commandes pour gérer les devoirs (à ajouter derrière `!hw`): ";
						hwHelpText += "\n :small_blue_diamond: `show` pour montrer les devoirs à faire, ";
						hwHelpText += "\n :small_blue_diamond: `show id` pour montrer les devoirs à faire avec les ids, ";
						hwHelpText += "\n :small_blue_diamond: `clean` pour supprimer les anciens devoirs, ";
						hwHelpText += "\n :small_blue_diamond: `delete [id]` pour supprimer un devoir précis avec son id, ";
						hwHelpText += "\n :small_blue_diamond: `add [aaaammjj] [matière] [libellé]` pour ajouter une date. ";
						functions.replyToMessage(msg, hwHelpText);
				}
				break;

			case 1285261448: // maketeams
				functions.deleteMessage(msg);

				if (arguments.length < 2) {
					functions.replyToMessage(msg, ":x: Oups, le nombre d'arguments pour cette commande n'est pas celui attendu. Fais `!help` pour voir ?");
					break;
				}

				var numberPerTeam = parseInt(arguments[0]);
				var role;
				if (arguments[1].substr(0, 2) == '<@') { 	// The [role] is the role's tag
					let id = msg.mentions.roles.first().id;
					role = msg.guild.roles.find(x => x.id == id);
				} else { 	// The [role] is the role's name
					var roleName = "";
					for (var i = 1; i < arguments.length; i++) {
						roleName += arguments[i];
						if (i < arguments.length - 1) {
							roleName += ' ';
						}
					}
					role = msg.guild.roles.find(x => x.name == roleName);
				}
				if (role === undefined || role === null) {
					functions.replyToMessage(msg, ":x: Le rôle *" + roleName + "* n'existe pas sur ce serveur, vérifie l'orthographe.");
					break;
				}


				abdessamad.maketeams(msg, numberPerTeam, role);
				break;

			case 104431: //int
				functions.deleteMessage(msg);
				var secondCommand = arguments[0];
				if (secondCommand == undefined) {
					secondCommand = "help";
				} else {
					secondCommand = secondCommand.toLowerCase();
				}
				switch (functions.hashCode(secondCommand)) {

					case functions.hashCode("show"):
						abdessamad.intshow(msg, dbClient);
						break;

					case functions.hashCode("add"):
						var person = msg.mentions.members.first().id;
						var number = parseInt(arguments[2]);
						if (person == undefined || number == undefined || isNaN(number)) {
							functions.replyToMessage(":vs: Les arguments ne sont pas valides, tape `!int help`.");
							break;
						}
						abdessamad.intadd(msg, dbClient, person, number);
						break;

					case functions.hashCode('help'): // help
						var commandNotExists = false;

					default:
						var hwHelpText = "";
						if (typeof commandNotExists == 'undefined' || commandNotExists) {
							hwHelpText += "Cette commande n'est pas reconnue.\n";
						}
						hwHelpText += "Comment gérer les points de int (à ajouter derrière `!int`): ";
						hwHelpText += "\n :small_blue_diamond: `show` pour voir le classement, ";
						hwHelpText += "\n :small_blue_diamond: `add [@personne] [nombre de points]` pour ajouter des points de int à quelqu'un.";
						functions.replyToMessage(msg, hwHelpText);


				}
				break;

			// if the command does not exist
			default:
				functions.deleteMessage(msg);
				functions.replyToMessage(msg, "Hum, la commande " + command + " n'est pas reconnue. Essaie `!help` pour voir ?");
				break;
		}
	}
});