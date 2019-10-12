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
const connection = require('./connection.js');

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
	var activity = connection.getLastActivity(dbClient);
	bot.user.setActivity(activity);
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

		switch (functions.hashCode(command)) {

			//help
			case 3198785:
				functions.deleteMessage(msg);
				//Define the !help text
				var helpText = "# Commandes actuelles : ";
				helpText += "\n :small_orange_diamond: `!help` pour obtenir de l'aide, ";
				helpText += "\n :small_orange_diamond: `!ping` pour jouer au tennis de table, ";
				helpText += "\n :small_orange_diamond: `!setActivity [+texte]` pour choisir l'activité du bot, ";
				helpText += "\n :small_orange_diamond: `!makeTeams [nombre par équipe] [role]` pour faire des équipes avec les membres d'un rôle, ";
				helpText += "\n :small_orange_diamond: `!hw [+2ème commande]` pour interagir avec les devoirs. ";
				msg.author.send(helpText);
				break;

			case 3441010:
				functions.replyToMessage(msg, "Pong ! :baseball:");
				break;

			case 268709233:
				functions.deleteMessage(msg);
				var newActivity = "";

				// Construct the new activity string
				for (var i = 0; i < arguments.length; i++) {
					newActivity += arguments[i] + ' ';
				}

				// If the string is too long (over 128 char)
				if (newActivity.length > 128) {
					functions.replyToMessage(msg, ":vs: Désolé, mais cette activité est trop longue, je ne peux effectuer que des activités de moins de 128 caractères. ");

				} else {
					// Stop all activity
					if (newActivity == "") {
						bot.user.setActivity();
						functions.replyToMessage(msg, "J'arrête toute activité et à partir de maintenant, je m'ennuie. Merci _" + msg.author.username + "_ :sob: ");
					} else {
						bot.user.setActivity(newActivity);
						functions.replyToMessage(msg, "Je suis maintenant en train de **" + newActivity + "** sur ordre de _" + msg.author.username + "_. :sunny: ");
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
			case 3343:

				// Get the second command and lowerCase it
				var secondCommand = arguments[0];
				if (secondCommand == undefined) {
					secondCommand = "help";
				} else {
					secondCommand = secondCommand.toLowerCase();
				}

				switch (functions.hashCode(secondCommand)) {

					// Show the homeworks
					case functions.hashCode('show'):
						functions.deleteMessage(msg);
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
									let text = functions.homework2string(resultRaw.rows[i]);

									//Add the IDs
									if (showID) {
										text += " (" + resultRaw.rows[i].id + ") ";
									}

									homeworksText += "\n" + text;
								}
							}
							functions.replyToMessage(msg, homeworksText);
						});
						break;


					// Delete old homework
					case functions.hashCode('clean'):
						functions.deleteMessage(msg);
						var nbElementSupprimes = 0;

						// Count the number of old homeworks
						var sqlQuery = "SELECT COUNT(id) AS number FROM homework WHERE date < NOW()::DATE";
						dbClient.query(sqlQuery, (err, result) => {
							if (err) {
								functions.replyToMessage(msg, ":x: Impossible de nettoyer ma mémoire, merci de vérifier mon code :thinking: ");
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
										functions.replyToMessage(msg, ":ballot_box_with_check: Pas d'ancien devoir à supprimer mais merci de vous soucier de ma mémoire :smile: ");
										break;

									case "1":
										functions.replyToMessage(msg, ":ballot_box_with_check: J'ai bien supprimé un ancien devoir. ");
										break;

									default:
										functions.replyToMessage(msg, ":ballot_box_with_check: J'ai bien supprimé " + nbElementSupprimes + " vieux devoirs. ");
								}
							}
						});
						break;


					// Add new homework
					case functions.hashCode('add'):
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
							functions.replyToMessage(msg, ":vs: Déso pas déso, la date que tu as entrée est déjà passée. Il faut la rentrer au format aaaammjj");
						} else if (!functions.isDateCorrect(date) || date == undefined) {
							functions.replyToMessage(msg, ":vs: Déso pas déso, la date que tu as entrée n'est pas valide. Il faut la rentrer au format aaaammjj");
						} else if (subject == undefined) {
							functions.replyToMessage(msg, ":vs: Coco, t'as même pas mis de matière, comment je suis censé gérer ça moi ? ");
						} else if (description == "") {
							functions.replyToMessage(msg, ":vs:  Bon, s'il n'y a rien à faire en description, pas la peine de m'appeler hein ! ");
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
									functions.replyToMessage(msg, ":x: Hum, impossible de rajouter ce devoir. Je crois qu'il faudrait checker mon code :thinking:")
								} else {
									functions.deleteMessage(msg);
									let homework = { "formateddate": date, "subject": subject, "description": description };
									functions.replyToMessage(msg, ":white_check_mark: J'ai bien rajouté à ma liste : " + functions.homework2string(homework));
								}
							});
						}
						break;


					// Delete a precise homework
					case functions.hashCode('delete'):
						functions.deleteMessage(msg);

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
								functions.replyToMessage(msg, ":x: Impossible de supprimer ce devoir, il semble ne pas exister")
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

									functions.replyToMessage(msg, ":zipper_mouth: Sur ordre de " + msg.author.username + ", j'ai bien supprimé le devoir : " + functions.homework2string(deletedHomework) + " ");
								} else {
									functions.replyToMessage(msg, ":vs: L'indice entré ne correspond à aucun devoir enregistré. ");
								}
							}
						});
						break;

					// help
					case functions.hashCode('help'):
						var commandNotExists = false;

					// help message
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

			case 1285261448:
				functions.deleteMessage(msg);

				if (arguments.length < 2) {
					functions.replyToMessage(msg, ":x: Oups, le nombre d'arguments pour cette commande n'est pas celui attendu. Fais `!help` pour voir ?");
					break;
				}

				var numberPerTeam = parseInt(arguments[0]);
				if (isNaN(numberPerTeam) || numberPerTeam < 2) {
					functions.replyToMessage(msg, ":vs: Tu crois vraiment qu'on va faire des équipes avec *" + numberPerTeam + "* personne dans chaque ? :P ");
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
					functions.replyToMessage(msg, ":x: Le rôle *" + roleName + "* n'existe pas sur ce serveur, vérifie l'orthographe.");
					break;
				}

				var members = role.members.map(m => m.displayName);

				if (members.length <= numberPerTeam) {
					functions.replyToMessage(msg, ":vs: Il y a moins de gens qui ont ce rôle que de personnes par équipe, donc ... tout le monde ensemble ! :confetti_ball: ");
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

				functions.replyToMessage(msg, teamsText);
				break;


			// if the command does not exist
			default:
				functions.deleteMessage(msg);
				functions.replyToMessage(msg, "Hum, la commande " + command + " n'est pas reconnue. Essaie `!help` pour voir ?");
				break;
		}
	}
});