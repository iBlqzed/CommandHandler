import { Command } from "../CommandHandler/index.js"

const cmd = new Command({ name: "test-sub1" })
const subCmdAdd = new Command({ name: "add" })
const subCmdRemove = new Command({ name: "remove" })

//@ts-ignore
subCmdAdd.addArgument("string").chainArgument("all", false, async (player, [obj, display]) => {
	const v = await player.runCommandAsync(`scoreboard objectives add "${obj}" dummy "${display}"`)
	if (v.successCount) return player.sendMessage(`§aAdded a scoreboard of name ${obj} with display "${display}"`)
	player.sendMessage(`§cScoreboard ${obj} already exist`)
})

subCmdAdd.addArgument("string", async (player, obj) => {
	const v = await player.runCommandAsync(`scoreboard objectives add "${obj}" dummy`)
	if (v.successCount) return player.sendMessage(`§aAdded a scoreboard of name ${obj}`)
	player.sendMessage(`§cScoreboard ${obj} already exist`)
})

subCmdRemove.addArgument("string", async (player, obj) => {
	const v = await player.runCommandAsync(`scoreboard objectives remove "${obj}"`)
	if (v.successCount) return player.sendMessage(`§aRemoved a scoreboard of name ${obj}`)
	player.sendMessage(`§cScoreboard ${obj} does not exist`)
})

cmd.addSubCommand(subCmdAdd)
cmd.addSubCommand(subCmdRemove)

Command.register(cmd)