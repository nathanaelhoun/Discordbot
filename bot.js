/**
 * Abdessamad, the gentle discord bot
 * Created to interact in discord class groups.
 * 
 * @version 1.0
 * @author Nathanaël Houn
 * @author Promo 2018 des CMI Informatique de Besançon
 */

// Load the discord.js library
const Discord = require('discord.js');

// Load the fs filesystem library
const fs = require('fs');

// Load the database library and create the client
// Using the Heroku PostGres database
const { Pool, Client } = require('pg');


// ------------------------
// 		Functions
// ------------------------

/**
 * Delete a message and log it into the console
 * 
 * @param {Message} message 
 */
function deleteMessage(message) {
	console.log('Deleted message from ', message.author.username);
	message.delete();
}

/**
 * Reply to a message with a string text
 * 
 * @param {Message} message the message to answer
 * @param {string} text the text to send
 */
function replyToMessage(message, text) {
	message.channel.send(text);
	console.log('Sent the message:', text);
}

/**
 * Checks that an yyyymmdd date is correct
 * 
 * @param {int} dateInt the date to check
 * @return {boolean} true if it is correct, false otherwise
 */
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

/**
 * Get a string with a good presentation from an homework object
 * 
 * @param {Homework} homework 
 * @return {string}
 */
function homework2string(homework) {
	return (homework.formateddate + " - **" + homework.subject + "** -  " + homework.description + " ");
}


// ------------------------
// 	Launching the bot
// ------------------------

// Create the client
const bot = new Discord.Client();

// Create the database pool
const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	port: 5432,
	ssl: true
});

// Create the database client
const dbClient = new Client({
	connectionString: process.env.DATABASE_URL,
	port: 5432,
	ssl: true
});

// Launch the client and connecting it to the database
bot.on('ready', () => {
	console.log("Je suis vivant !");
	var activity = "";

	// Query the database for the actual activity of the bot
	var sqlQuery = "SELECT * FROM activity ORDER BY id DESC";
	dbClient.query(sqlQuery, (err, result) => {
		if (err) throw err;

		if (result.rows[0] != undefined) {
			activity = result.rows[0].label;
			bot.user.setActivity(activity);
		}
	})

	console.log("Activité actuelle : " + activity);

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

		//Detect the command and execute it
		switch (command) {

			//help
			case 'help':
				deleteMessage(msg);
				//Define the !help text
				var helpText = "# Commandes actuelles : ";
				helpText += "\n :small_orange_diamond: \'!help\' pour obtenir de l'aide, ";
				helpText += "\n :small_orange_diamond: \'!ping\' pour jouer au tennis de table, ";
				helpText += "\n :small_orange_diamond: \'!setActivity [+texte]\' pour choisir l'activité du bot, ";
				helpText += "\n :small_orange_diamond: \'!makeTeams [nombre par équipe] [role]\' pour faire des équipes avec les membres d'un rôle, ";
				helpText += "\n :small_orange_diamond: \'!hw [+2ème commande]\' pour interagir avec les devoirs. ";
				replyToMessage(msg, helpText);
				break;

			case 'ping':
				replyToMessage(msg, "Pong ! :baseball:");
				break;

			case 'setactivity':
				deleteMessage(msg);
				var newActivity = "";

				// Construct the new activity string
				for (var i = 0; i < arguments.length; i++) {
					newActivity += arguments[i] + ' ';
				}

				// If the string is too long (over 128 char)
				if (newActivity.length > 128) {
					replyToMessage(msg, ":vs: Désolé, mais cette activité est trop longue, je ne peux effectuer que des activités de moins de 128 caractères. ");

				} else {
					// Stop all activity
					if (newActivity == "") {
						bot.user.setActivity();
						replyToMessage(msg, "J'arrête toute activité et à partir de maintenant, je m'ennuie. Merci _" + msg.author.username + "_ :sob: ");
					} else {
						bot.user.setActivity(newActivity);
						replyToMessage(msg, "Je suis maintenant en train de **" + newActivity + "** sur ordre de _" + msg.author.username + "_. :sunny: ");
					}

					// Save the new activity in the database
					var sqlQuery = {
						text: 'INSERT INTO activity(label) VALUES ($1)',
						values: [newActivity],
					}
					dbClient.query(sqlQuery, (err, res) => {
						if (err) throw err;
					});
				}

				break;


			// Commands relative to the homeworks
			case "hw":

				// Get the second command and lowerCase it
				var secondCommand = arguments[0];
				if (secondCommand == undefined) {
					secondCommand = "help";
				} else {
					secondCommand = secondCommand.toLowerCase();
				}

				switch (secondCommand) {

					// Show the homeworks
					case 'show':
						deleteMessage(msg);
						var homeworksText = "";
						var showID = false;

						// If the user ask to see the IDs
						if (arguments[1] == "id") {
							showID = true;
						}

						//Query the database
						var sqlQuery = "SELECT id, TO_CHAR(date, 'dd/mm/yyyy') AS formateddate, subject,description FROM homework WHERE date >= NOW()::DATE ORDER BY date,subject";

						dbClient.query(sqlQuery, (err, resultRaw) => {
							if (err) throw err;

							// Construct the message
							if (resultRaw.rows.length == 0) {
								homeworksText = "Étrange... Pas de devoirs :thinking: ";
							} else {
								homeworksText = ":blue_book: Voici les devoirs à faire, bon courage : ";
								for (var i = 0; i < resultRaw.rows.length; i++) {
									let text = homework2string(resultRaw.rows[i]);

									//Add the IDs
									if (showID) {
										text += " (" + resultRaw.rows[i].id + ") ";
									}

									homeworksText += "\n" + text;
								}
							}
							replyToMessage(msg, homeworksText);
						});
						break;


					// Delete old homework
					case 'clean':
						deleteMessage(msg);
						var nbElementSupprimes = 0;

						// Count the number of old homeworks
						var sqlQuery = "SELECT COUNT(id) AS number FROM homework WHERE date < NOW()::DATE";
						dbClient.query(sqlQuery, (err, result) => {
							if (err) {
								replyToMessage(msg, ":x: Impossible de nettoyer ma mémoire, merci de vérifier mon code :thinking: ");
								throw err;
							} else {
								nbElementSupprimes = result.rows[0].number;

								// S'il y a des éléments à supprimer, on les supprime
								if (nbElementSupprimes > 0) {
									var sqlQuery = "DELETE FROM homework WHERE date < NOW()::DATE";
									dbClient.query(sqlQuery, (err, result) => {
										if (err) throw err;
									});
								}

								//On envoie un message pour informer du nombre d'éléments supprimés
								switch (nbElementSupprimes) {
									case "0":
										replyToMessage(msg, ":ballot_box_with_check: Pas d'ancien devoir à supprimer mais merci de vous soucier de ma mémoire :smile: ");
										break;

									case "1":
										replyToMessage(msg, ":ballot_box_with_check: J'ai bien supprimé un ancien devoir. ");
										break;

									default:
										replyToMessage(msg, ":ballot_box_with_check: J'ai bien supprimé " + nbElementSupprimes + " vieux devoirs. ");
								}
							}
						});
						break;


					// Add new homework
					case 'add':
						var date = arguments[1];
						var subject = arguments[2];
						var description = "";
						for (var i = 3; i < arguments.length; i++) {
							description += arguments[i] + " ";
						}


						// What is today's date ?
						var now = new Date();
						var today = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();

						// Check if the date entry is correct
						if (date < today) {
							replyToMessage(msg, ":vs: Déso pas déso, la date que tu as entrée est déjà passée. Il faut la rentrer au format aaaammjj");
						} else if (!isDateCorrect(date) || date == undefined) {
							replyToMessage(msg, ":vs: Déso pas déso, la date que tu as entrée n'est pas valide. Il faut la rentrer au format aaaammjj");
						} else if (subject == undefined) {
							replyToMessage(msg, ":vs: Coco, t'as même pas mis de matière, comment je suis censé gérer ça moi ? ");
						} else if (description == "") {
							replyToMessage(msg, ":vs:  Bon, s'il n'y a rien à faire en description, pas la peine de m'appeler hein ! ");
						} else {
							// The date entry is correct so
							// Add it to the database
							var sqlQuery = {
								text: 'INSERT INTO homework(date, subject, description) VALUES($1, $2, $3)',
								values: [date, subject, description],
							}

							dbClient.query(sqlQuery, (err, res) => {
								if (err) {
									console.log(err.stack)
									replyToMessage(msg, ":x: Hum, impossible de rajouter ce devoir. Je crois qu'il faudrait checker mon code :thinking:")
								} else {
									deleteMessage(msg);
									let homework = { "formateddate": date, "subject": subject, "description": description };
									replyToMessage(msg, ":white_check_mark: J'ai bien rajouté à ma liste : " + homework2string(homework));
								}
							});
						}
						break;


					// Delete a precise homework
					case 'delete':
						deleteMessage(msg);

						var id = arguments[1];
						var deletedHomework;
						// Get the homework that will be deleted
						var sqlQuery = {
							text: "SELECT id, TO_CHAR(date, 'dd/mm/yyyy') AS formateddate, subject, description FROM homework WHERE id = $1",
							values: [id],
						}

						dbClient.query(sqlQuery, (err, result) => {
							if (err) {
								console.log(err.stack);
								replyToMessage(msg, ":x: Impossible de supprimer ce devoir, il semble ne pas exister")
							} else {
								deletedHomework = result.rows[0];

								if (deletedHomework != undefined) {
									// Delete the homework if it exists
									sqlQuery = {
										text: 'DELETE FROM homework WHERE id = $1',
										values: [id],
									}
									dbClient.query(sqlQuery, (err, result) => {
										if (err) throw err;
									});

									replyToMessage(msg, ":zipper_mouth: Sur ordre de " + msg.author.username + ", j'ai bien supprimé le devoir : " + homework2string(deletedHomework) + " ");
								} else {
									replyToMessage(msg, ":vs: L'indice entré ne correspond à aucun devoir enregistré. ");
								}
							}
						});
						break;

					// help
					case 'help':
						var commandNotExists = false;

					// help message
					default:
						var hwHelpText = "";
						if (typeof commandNotExists == 'undefined' || commandNotExists) {
							hwHelpText += "Cette commande n'est pas reconnue.\n";
						}
						hwHelpText += "Voici les commandes pour gérer les devoirs (à ajouter derrière \'!hw\'): ";
						hwHelpText += "\n :small_blue_diamond: \'show\' pour montrer les devoirs à faire, ";
						hwHelpText += "\n :small_blue_diamond: \'show id\' pour montrer les devoirs à faire avec les ids, ";
						hwHelpText += "\n :small_blue_diamond: \'clean\' pour supprimer les anciens devoirs, ";
						hwHelpText += "\n :small_blue_diamond: \'delete [id]\' pour supprimer un devoir précis avec son id, ";
						hwHelpText += "\n :small_blue_diamond: \'add [aaaammjj] [matière] [libellé]\' pour ajouter une date. ";
						replyToMessage(msg, hwHelpText);
				}
				break;

			case 'maketeams':
				deleteMessage(msg);

				if (arguments.length < 2) {
					replyToMessage(msg, ":x: Oups, le nombre d'arguments pour cette commande n'est pas celui attendu. Fais \'!help\' pour voir ?");
					break;
				}

				var numberPerTeam = parseInt(arguments[0]);
				if (isNaN(numberPerTeam) || numberPerTeam < 2) {
					replyToMessage(msg, ":vs: Tu crois vraiment qu'on va faire des équipes avec *" + numberPerTeam + "* personne dans chaque ? :P ");
					break;
				}

				var role;

				if (arguments[1].substr(0, 2) == '<@') {
					// The [role] is the role's tag
					let id = msg.mentions.roles.first().id;
					role = msg.guild.roles.find(x => x.id == id);
				} else {
					// The [role] is the role's name
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
					replyToMessage(msg, ":x: Le rôle *" + roleName + "* n'existe pas sur ce serveur, vérifie l'orthographe.");
					break;
				}

				var members = role.members.map(m => m.displayName);

				if (members.length <= numberPerTeam) {
					replyToMessage(msg, ":vs: Il y a moins de gens qui ont ce rôle que de personnes par équipe, donc ... tout le monde ensemble ! :confetti_ball: ");
					break;
				}

				// Randomization
				var isPerfect = (members.length % numberPerTeam) == 0;
				var teams = [];
				var team_number = 0;
				teams[0] = [];

				while (members.length > 0) {
					if (teams[team_number].length >= numberPerTeam) {
						team_number++;
						teams[team_number] = [];
					}
					let randomNumber = parseInt(Math.random() * members.length);

					teams[team_number].push(members[randomNumber]);

					members.splice(randomNumber, 1);
				}

				var teamsText = ":white_check_mark: J'ai constitué des groupes de " + numberPerTeam + " avec le rôle <@&" + role.id + ">";
				if (!isPerfect) {
					teamsText += " (mais désolé, pas toutes égales, j'ai fait au mieux...) ";

					if (teams[team_number].length == 1) {
						let randomNumber = parseInt(Math.random() * (teams.length - 1));
						teams[randomNumber].push(teams[team_number][0]);
						teams.splice(team_number, 1);
						teamsText += "(et au moins le dernier n'est pas tout seul)"
					}
				}
				for (let i = 0; i < teams.length; i++) {
					teamsText += "\n :diamond_shape_with_a_dot_inside:  Équipe " + (i + 1) + " : ";
					for (let j = 0; j < teams[i].length; j++) {
						teamsText += "\n		:white_medium_small_square:  " + teams[i][j];
					}
				}

				replyToMessage(msg, teamsText);
				break;


			// if the command does not exist
			default:
				mention
				deleteMessage(msg);
				replyToMessage(msg, "Hum, la commande " + command + " n'est pas reconnue. Essaie \'!help\' pour voir ?");
				break;
		}
	}
});


// ---------------------------------
//	Use the token (stored on Heroku)
// ---------------------------------
bot.login(process.env.BOT_TOKEN);