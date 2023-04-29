import { Command } from "../CommandHandler/index.js";
const cmd = new Command({ name: "test-chained" });
cmd.addChainedArguments(["string", "number"], (player, [str, num]) => {
    player.sendMessage(`You input a string (${str}) and then a number (${num})`);
});
cmd.addChainedArguments(["number", "string"], (player, [num, str]) => {
    player.sendMessage(`You input a number (${num}) and then a string (${str})`);
});
Command.register(cmd);
