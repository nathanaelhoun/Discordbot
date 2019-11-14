/**
 * Abdessamad, the gentle discord bot
 * Created to interact in discord class groups.
 *
 * @version 2.0
 * @author Nathanaël Houn
 * @author Promo 2018 des CMI Informatique de Besançon
 */

function activityTable_clean(dbClient) {
    var sql = {
        text: 'DELETE FROM bot_activity WHERE act_label = ($1)',
        values: [""]
    }
    dbClient.query(sql, (err) => {
        if (err) throw err
    })
}

exports.activity_push = function (dbClient, label) {
    activityTable_clean(dbClient)

    var sqlQuery = {
        text: 'INSERT INTO bot_activity(act_label) VALUES ($1);',
        values: [label],
    }
    dbClient.query(sqlQuery, (err, res) => {
        if (err) throw err
    })
}

exports.hw_push = function (dbClient, type, subject, date, label) {
    var sqlQuery = {
        text: 'INSERT INTO homework(hom_type, hom_date, hom_subject, hom_label) VALUES ($1, $2, $3, $4);',
        values: [type, date, subject, label],
    }
    dbClient.query(sqlQuery, (err, res) => {
        if (err) throw err
    })
}

exports.intpoints_add = function (dbClient, player, number, isJustified) {
    var sqlQuery = {
        text: "SELECT * FROM int_points WHERE int_player_id = $1",
        values: [player.id]
    }

    dbClient.query(sqlQuery, (err, result) => {
        if (err) throw err

        var sqlQuery2 = ""

        if (result.rowCount != 0) {
            var actualPoints = 0

            if (isJustified) {
                actualPoints = parseInt(result.rows[0].int_justified_points) + number
                sqlQuery2 = {
                    text: "UPDATE int_points SET int_justified_points = $1 WHERE int_player_id = $2",
                    values: [actualPoints, player.id],
                }
            } else {
                actualPoints = parseInt(result.rows[0].int_unjustified_points) + number
                sqlQuery2 = {
                    text: "UPDATE int_points SET int_unjustified_points = $1 WHERE int_player_id = $2",
                    values: [actualPoints, player.id],
                }
            }
        } else {
            if (isJustified) {
                sqlQuery2 = {
                    text: "INSERT INTO int_points VALUES($1,$2,0)",
                    values: [player.id, number],
                }
            } else {
                sqlQuery2 = {
                    text: "INSERT INTO int_points VALUES($1,0,$2)",
                    values: [player.id, number],
                }
            }
        }

        dbClient.query(sqlQuery2, (err) => {
            if (err) throw err;
        })
    })
}