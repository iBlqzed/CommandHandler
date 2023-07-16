import { Command } from "../CommandHandler/index.js"

const cmd = new Command({ name: "test-sub" })

cmd.addSubCommand(
	new Command({ name: "add" }).addChainedArguments(["string", "all"] as const, async (player, [obj, display]) => {
		const v = await player.runCommandAsync(`scoreboard objectives add "${obj}" dummy "${display}"`)
		if (v.successCount) return player.sendMessage(`§aAdded a scoreboard of name ${obj} with display "${display}"`)
		player.sendMessage(`§cScoreboard ${obj} already exist`)
	}).addArgument("string", async (player, obj) => {
		const v = await player.runCommandAsync(`scoreboard objectives add "${obj}" dummy`)
		if (v.successCount) return player.sendMessage(`§aAdded a scoreboard of name ${obj}`)
		player.sendMessage(`§cScoreboard ${obj} already exist`)
	})
)

cmd.addSubCommand(
	new Command({ name: "remove" }).addArgument("string", async (player, obj) => {
		const v = await player.runCommandAsync(`scoreboard objectives remove ${obj}`)
		if (v.successCount) return player.sendMessage(`§aRemoved a scoreboard of name ${v.successCount}`)
		player.sendMessage(`§cScoreboard ${obj} does not exist`)
	})
)

Command.register(cmd)