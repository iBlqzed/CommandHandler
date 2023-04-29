import { Command } from "../CommandHandler/index.js"
import { world } from "@minecraft/server"

const cmd = new Command({ name: "test-sub" })

cmd.addSubCommand(
	new Command({ name: "add" }).addChainedArguments(["string", "all"] as const, (player, [obj, display]) => {
		console.warn("worked double")
		player.runCommandAsync(`scoreboard objectives add "${obj}" dummy "${display}"`)
	}).addArgument("string", (player, obj) => {
		console.warn("worked single")
		player.runCommandAsync(`scoreboard objectives add "${obj}" dummy`)
	})
)

cmd.addSubCommand(
	new Command({ name: "remove" }).addArgument("string", (player, value) => {
		player.runCommandAsync(`scoreboard objectives remove ${value}`)
	})
)

Command.register(cmd)