# Contributing to Abdessamad

The following document is a set of guidelines for contributing to Abdessamad the discordbot.

## What is a contribution

This bot is made of a bundle of commands like *!help* (showing a list of commands), or *!setactivity* (changing the activity of the bot on Discord).
You can easily improve this bot by adding any features or adding new commands.
For that, you have to follow some rules for your additions to work.

## A few information
The only file you must change is **bot.js** and **abdessamad_features.js**.
To add a command, the interesting part is in `bot.on('message', msg => {`.

## How to contribute

### Add a command

If you want to add a command, you have to write in the switch (`switch(command){`) the hashed code of the command written in lowercase letters.

### Testing your feature
You don't have access to the token of the real Abdessamad bot.
We only give it to trustworthy people. So, you can ask for it to Nathanaël or test your feature on a private discorbot.

### Send us your change

To send us your upgrade, just create a pull request.

**Thank you!** / **Merci !**
