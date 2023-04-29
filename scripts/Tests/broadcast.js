import { Command } from "../CommandHandler/index.js";
import { world } from "@minecraft/server";
const cmd = new Command({ name: "broadcast", permission: (plr) => plr.hasTag("Admin") });
cmd.addArgument("all", (_, value) => {
    world.sendMessage(`[§6§lBROADCAST§r] ${value}`);
});
Command.register(cmd);
