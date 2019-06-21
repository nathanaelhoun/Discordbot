# Contributing to Abdessamad / Contribuer à Abdessamad

The following document is a set of guidelines for contributing to Abdessamad the discordbot.

Le document suivant est un ensemble de guides pour contribuer à Abdessamad le bot Discord.

## What is a contribution / Qu'est-ce qu'une contribution

This bot is made of a bundle of commands like *!help* (showing a list of commands), or *!setactivity* (changing the activity of the bot on Discord).
You can easily improve this bot by adding any features or adding new commands.
For that, you have to follow some rules for your additions to work.

Abdessamad répond à un ensemble de commandes commme *!help* (qui montre la liste des commandes disponibles), ou *!setactivity* (qui change l'activité du bot sur Discord).
Vous pouvez facilement améliorer le bot en ajoutant des fonctionnalités comme des nouvelles commandes
Pour ça, voici quelques règles à suivre.

## A few information / Quelque informations

The only file you must change is **bot.js**.
To add a command, the interesting part is in `bot.on('message', msg => {`.

Le seul fichier que vous avez à changer est **bot.js**.
Pour ajouter une commande, la partie intéressante du programme est dans `bot.on('message', msg => {`.

## How to contribute / Comment contribuer

### Add a command / Ajouter une commande

If you want to add a command, you have to writing it the the switch (`switch(command){`) in lowercase letters.

Si vous voulez ajouter une commande, vous devez l'écrire dans le *switch* (`switch(command){`) en lettres minuscules.

### Testing your feature / Tester votre fonctionnalité

You don't have access to the token of the real Abdessamad bot.
We only give it to trustworthy people. So, you can ask for it to Nathanaël or test your feature on a private discorbot.

Vous n'avez pas accès au token d'identification du vrai Abdessmad.
Nous le confions uniquement à des personnes de confiance. Vous pouvez nous le demander ou tester votre fonctionnalité sur un bot privé.

### Send us your change / Envoyez-nous votre changement

To send us your upgrade, just create a push request.

Pour nous envoyer votre amélioration, il suffit de créer une *push request*.

**Thank you!** / **Merci !**
