import { Command } from "../CommandHandler/index.js";
const cmd = new Command({ name: "test-sub2" });
const subCmdAdd = new Command({ name: "add" });
const subCmdRemove = new Command({ name: "remove" });
//@ts-ignore
subCmdAdd.addArgument("player").chainArgument("all", false, async (player, [target, tag]) => {
    player.sendMessage(`§aAdded tag "${tag}§r§a" to ${target.name}`);
    target.addTag(tag);
});
subCmdRemove.addArgument("player").chainArgument("all", false, async (player, [target, tag]) => {
    player.sendMessage(`§aRemoved tag "${tag}§r§a" from ${target.name}`);
    target.removeTag(tag);
});
cmd.addSubCommand(subCmdAdd);
cmd.addSubCommand(subCmdRemove);
Command.register(cmd);
