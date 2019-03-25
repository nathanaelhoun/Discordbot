Contributing to Abdessamad the discordbot
==============================

The following document is a set of guidelines for contributing to Abdessamad the discordbot.

## What's a contribution ?
This bot is made of a bundle of commands like *!help* (showing a list of commands), or *!setactivity* (changing the activity of the bot on Discord).
You can easily improve this bot by adding any features or adding new commands.
For that, you have to follow some rules for your additions to work.

## A few informations
The only file you must change is **bot.js**.
To improving the bot, the interesting part is in `bot.on('message', msg => {`.

## Contributing

### Adding the command
If you want to add a command, you have to writing it the the switch (`switch(cmd){`) in lowercase letters.

### Testing your feature
You don't have access to the token of the real Abdessamad bot.
In order to test the feature you have added, you need to create a Discord app and store your app's token in a config.json file. Then you will be able to test the feature in a private discord server.  

### Sending of the change
Once the upgrade did, there are two possibilites.<br />
The first, you are a member of the class group that uses this bot. So, you are a contributor you can push your upgrade.
The second, you aren't a member of the class group. To send your upgrade, you have to send a push request.


**Thank you!**
