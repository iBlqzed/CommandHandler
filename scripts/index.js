import { Command } from "./Papers/commandHandler";
const myCommand = new Command({
    name: 'test'
});
myCommand.addArgument(0, 'boolean');
myCommand.addArgument(1, 'player');
myCommand.callback((player, args) => {
    player.runCommand(`say ${args[2].value}`);
});
myCommand.register();
