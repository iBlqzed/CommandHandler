import { Command } from "../CommandHandler/index.js";
import { world } from "@minecraft/server";
const cmd = new Command({ name: "pay" });
cmd.addChainedArguments(["player", "number"], (player, [target, money]) => {
    if (!Number.isSafeInteger(money))
        return player.sendMessage(`§cMoney needs to be a whole number!`);
    if (money < 0)
        return player.sendMessage(`§cYou can't send a negative number!`);
    if (getScore(player, "money") < money)
        return player.sendMessage(`§cYou can't send more money than you have!`);
    player.runCommandAsync(`scoreboard players remove @s money ${money}`);
    target.runCommandAsync(`scoreboard players add @s money ${money}`);
    player.sendMessage(`§aSuccessfully sent $${money} to ${target.name}`);
    target.sendMessage(`§a${player.name} sent $${money} to you`);
});
function getScore(player, objective) {
    try {
        return world.scoreboard.getObjective(objective).getScore(player.scoreboard);
    }
    catch {
        return 0;
    }
}
Command.register(cmd);
