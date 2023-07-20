import { Command } from "../CommandHandler/index.js";
const cmd = new Command({ name: "test-optional2" });
//@ts-ignore
cmd.addArgument("string").chainArgument("number", true, (player, [str, num]) => {
    if (num)
        player.sendMessage(`After the string ${str}, you entered ${num}`);
    else
        player.sendMessage(`After the string ${str}, you !`);
});
Command.register(cmd);
