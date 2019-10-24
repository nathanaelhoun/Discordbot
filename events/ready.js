/**
 * Abdessamad, the gentle discord bot
 * Created to interact in discord class groups.
 * 
 * @version 2.0
 * @author Nathanaël Houn
 * @author Promo 2018 des CMI Informatique de Besançon
 */

module.exports = (client, dbClient) => {
    console.log("I'm alive! ")
    console.log(`Logged in as ${client.user.tag}.`)
    dbClient.connect((err) => {
        var activity = ""

        if (err) {
            console.error('Database connection failed : ', err.stack)
            console.log(" /!\ Database connection failed.")
            var failedDbConnectionActivity = "se débrouiller sans la base de données"
            client.user.setActivity(failedDbConnectionActivity)
            console.log("Current activity : " + failedDbConnectionActivity)
        } else {

            console.log("Connected to the database successfully.")
            dbClient.query("SELECT * FROM bot_activity ORDER BY act_id DESC", (err, result) => {
                if (err) throw err

                if (result.rows[0] != undefined) {
                    activity = result.rows[0].act_label
                    client.user.setActivity(activity)
                }
                console.log("Current activity : " + activity)
            })
        }
    })
}