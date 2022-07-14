import { Command } from "./Papers/commandHandler";

const kickCommand = new Command({ //Defining a new Command() variable
    name: 'kick', //Name of the command
    description: 'Kicks a player', //Description of the command
    permissions: ["Admin"] //Permissions (tags) for the command
})

kickCommand.addArgument(0, "playerOnline") //Adding a playerOnline argument

kickCommand.callback((player, args) => { //Making the command callback
    player.runCommand(`kick "${args[0].value}" ${args.length > 1 ? args.filter((e, i) => i > 0).map(value => value.value).join(' ') : ''}`) //Kicking the player defined in argument 1, and adding a reason
})

kickCommand.register() //Registering the command