import { Command } from "../CommandHandler/index.js";
const cmd = new Command({ name: "test-chained" });
//@ts-ignore
cmd.addArgument("number").chainArgument("string", false, (player, [str, num]) => {
    player.sendMessage(`You input a number (${str}) and then a string (${num})`);
});
//@ts-ignore
cmd.addArgument("string").chainArgument("string", false, (player, [str, num]) => {
    player.sendMessage(`You input a string (${str}) and then a number (${num})`);
});
Command.register(cmd);
