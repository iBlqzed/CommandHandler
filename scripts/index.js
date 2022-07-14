import { Command } from "./Papers/commandHandler";
const myCommand = new Command({
    name: 'test'
});
myCommand.addArgument(0, 'boolean');
myCommand.addArgument(1, 'playerOnline');
myCommand.addArgument(1, 'player');
myCommand.addArgument(1, 'boolean');
myCommand.callback((player, args) => {
    player.runCommand(`say ${args[1].value}`);
});
myCommand.register();
