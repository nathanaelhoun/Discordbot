const functions = require('./functions.js');

/**
 * Send a message to the asker with help informations
 * 
 * @param {Message} msg
 */
exports.help = function (msg) {
    functions.deleteMessage(msg);
    //Define the !help text
    var helpText = "# Commandes actuelles : ";
    helpText += "\n :small_orange_diamond: `!help` pour obtenir de l'aide, ";
    helpText += "\n :small_orange_diamond: `!ping` pour jouer au tennis de table, ";
    helpText += "\n :small_orange_diamond: `!setActivity [+texte]` pour choisir l'activité du bot, ";
    helpText += "\n :small_orange_diamond: `!makeTeams [nombre par équipe] [role]` pour faire des équipes avec les membres d'un rôle, ";
    helpText += "\n :small_orange_diamond: `!int [add / show]` pour interagir avec les points de int, ";
    helpText += "\n :small_orange_diamond: `!hw [+2ème commande]` pour interagir avec les devoirs. ";
    msg.author.send(helpText);
}

/**
 * Set the discord bot activity
 * 
 * @param {Message} msg
 * @param {Discord.Client} bot
 * @param {Client} dbClient
 */
exports.setactivity = function (msg, bot, dbClient, arguments) {
    var newActivity = "";

    // Construct the new activity string
    for (var i = 0; i < arguments.length; i++) {
        newActivity += arguments[i] + ' ';
    }

    // If the string is too long (over 128 char)
    if (newActivity.length > 128) {
        functions.replyToMessage(msg, ":vs: Désolé, mais cette activité est trop longue, je ne peux effectuer que des activités de moins de 128 caractères. ");

    } else if (newActivity == "") {
        bot.user.setActivity();
        functions.replyToMessage(msg, "J'arrête toute activité et à partir de maintenant, je m'ennuie. Merci _" + msg.author.username + "_ :sob: ");

    } else {
        bot.user.setActivity(newActivity);
        functions.replyToMessage(msg, "Je suis maintenant en train de **" + newActivity + "** sur ordre de _" + msg.author.username + "_. :sunny: ");

        var sqlQuery = {
            text: 'INSERT INTO activity(label) VALUES ($1)',
            values: [newActivity],
        }
        dbClient.query(sqlQuery, (err, res) => {
            if (err) throw err;
        });
    }
}


/**
 * Display the homeworks to do
 * 
 * @param {Message} msg
 * @param {Client} dbClient
 * @param {boolean} showIDs true to show the homework ids
 */
exports.hwshow = function (msg, dbClient, showIDs) {
    var homeworksText = "";

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
                if (showIDs) {
                    text += " (" + resultRaw.rows[i].id + ") ";
                }

                homeworksText += "\n" + text;
            }
        }
        functions.replyToMessage(msg, homeworksText);
    });
}

/**
 * Clean the table by deleting the old homeworks
 * 
 * @param {Message} msg
 * @param {Client} dbClient
 */
exports.hwclean = function (msg, dbClient) {
    var deletedElementsNumber = 0;

    var sqlQuery = "SELECT COUNT(id) AS number FROM homework WHERE date < NOW()::DATE";
    dbClient.query(sqlQuery, (err, result) => {
        if (err) {
            functions.replyToMessage(msg, ":x: Impossible de nettoyer ma mémoire, merci de vérifier mon code :thinking: ");
            throw err;
        } else {
            deletedElementsNumber = result.rows[0].number;

            if (deletedElementsNumber > 0) {
                var sqlQuery = "DELETE FROM homework WHERE date < NOW()::DATE";
                dbClient.query(sqlQuery, (err, result) => {
                    if (err) throw err;
                });
            }

            switch (deletedElementsNumber) { // Send a message with the number of deleted homeworks
                case "0":
                    functions.replyToMessage(msg, ":ballot_box_with_check: Pas d'ancien devoir à supprimer mais merci de vous soucier de ma mémoire :smile: ");
                    break;

                case "1":
                    functions.replyToMessage(msg, ":ballot_box_with_check: J'ai bien supprimé un ancien devoir. ");
                    break;

                default:
                    functions.replyToMessage(msg, ":ballot_box_with_check: J'ai bien supprimé " + deletedElementsNumber + " vieux devoirs. ");
            }
        }
    });
}

/**
 * Add homework
 * 
 * @param {Message} msg
 * @param {Client} dbClient
 */
exports.hwadd = function (msg, dbClient, date, subject, description) {
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

/**
 * Delete a homework from the table
 * 
 * @param {Message} msg
 * @param {Client} dbClient
 * @param {int} hwId
 */
exports.hwdelete = function (msg, dbClient, hwId) {
    var deletedHomework;
    if (isNaN(hwId)) {
        functions.replyToMessage(msg, ":vs: Aucun indice n'a été rentré ");
        return;
    }

    var sqlQuery = {     // Get the homework that will be deleted
        text: "SELECT id, TO_CHAR(date, 'dd/mm/yyyy') AS formateddate, subject, description FROM homework WHERE id = $1",
        values: [hwId],
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
                    values: [hwId],
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
}

/**
 * Randomize teams with the members of a discord role
 * 
 * @param {Message} msg
 * @param {int} numberPerTeam
 * @param {Role} role
 */
exports.maketeams = function (msg, numberPerTeam, role) {
    if (isNaN(numberPerTeam) || numberPerTeam < 2) {
        functions.replyToMessage(msg, ":vs: Tu crois vraiment qu'on va faire des équipes avec *" + numberPerTeam + "* personne dans chaque ? :P ");
        return;
    }

    var members = role.members.map(m => m.displayName);

    if (members.length <= numberPerTeam) {
        functions.replyToMessage(msg, ":vs: Il y a moins de gens qui ont ce rôle que de personnes par équipe, donc ... tout le monde ensemble ! :confetti_ball: ");
        return;
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
}

/**
 * Add 'int' points to a server member 
 * 
 * @param {Message} msg
 * @param {Client} dbClient
 * @param {GuildMember.id} person
 * @param {int} number
 */
exports.intadd = function (msg, dbClient, person, number) {
    var member = msg.guild.members.find(x => x.user.id == person);
    if (member == undefined) {
        functions.replyToMessage(msg, ":x: Il semblerait que la personne mentionnée ne soit pas sur le serveur...");
        return;
    }

    var sqlQuery = {
        text: "SELECT * FROM int_points WHERE int_id =  $1",
        values: [member.id],
    };
    dbClient.query(sqlQuery, (err, resultRaw) => {
        if (err) throw err;

        var sqlQuery2 = "";
        if (resultRaw.rows.length != 0) {
            var actualPoints = parseInt(resultRaw.rows[0].int_number) + number;
            sqlQuery2 = {
                text: "UPDATE int_points SET int_number = $1 WHERE int_id = $2  ",
                values: [actualPoints, member.id],
            };
        } else {
            sqlQuery2 = {
                text: "INSERT INTO int_points VALUES($1,$2)",
                values: [member.id, number],
            };
        }
        dbClient.query(sqlQuery2, (err) => {
            if (err) throw err;

            var replyString = "";
            if (number > 0) {
                replyString += "J'ai bien rajouté ";
            } else {
                replyString += "J'ai bien retiré ";
            }
            replyString += number + " point";
            if (number != 0 && number != 1 && number != -1) {
                replyString += "s";
            }
            replyString += " de int à *" + member.displayName + "* sur ordre de _" + msg.author.username + "_.";
            functions.replyToMessage(msg, replyString);

        });

    });

}

/**
 * Display the 'int' points classment
 * 
 * @param {Message} msg
 * @param {Client} dbClient
 */
exports.intshow = function (msg, dbClient) {
    var sqlQuery = "SELECT * FROM int_points ORDER BY int_number DESC";

    dbClient.query(sqlQuery, (err, resultRaw) => {
        if (err) throw err;

        if (resultRaw.rows.length == 0) {
            functions.replyToMessage(msg, "Rien à afficher. Vous êtes tous des élèves sages. :scream: ");
            return;
        }

        var text = ":trophy: Et voici le classement des points de int : ";

        var i = 0;
        while (i < resultRaw.rows.length) {
            var classment = i + 1;
            do {
                var member = msg.guild.members.find(x => x.user.id == resultRaw.rows[i].int_id);
                if (member == undefined) {
                    member = "_(a quitté le serveur)_";
                } else {
                    member = member.displayName;
                }
                text += "\n#" + classment + " : " + member + " _(" + resultRaw.rows[i].int_number + " point";
                if (resultRaw.rows[i].int_number != 0 && resultRaw.rows[i].int_number != 1 && resultRaw.rows[i].int_number != -1) {
                    text += "s";
                }
                text += ")_";
                i++;
            } while (i < resultRaw.rows.length && resultRaw.rows[i - 1].int_number == resultRaw.rows[i].int_number);
        }

        functions.replyToMessage(msg, text);
    });

}