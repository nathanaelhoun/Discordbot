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