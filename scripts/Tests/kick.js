import { Command } from "../CommandHandler/index.js";
import { world } from "@minecraft/server";
const cmd = new Command({ name: "kick", permission: (player) => player.hasTag("Admin") });
cmd.addChainedArguments(["player", "all"], (player, [target, reason]) => {
    if (player.name === target.name)
        return player.sendMessage(`§cYou can't kick yourself!`);
    world.sendMessage(`[§6§lKICK§r] ${target.name} was kicked by ${player.name} for "${reason === "" ? "No reason available..." : reason}"`);
    target.runCommandAsync(`kick "${target.name}" ${reason === "" ? "No reason available..." : reason}`);
});
Command.register(cmd);
