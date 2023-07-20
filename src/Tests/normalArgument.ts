import { Command } from "../CommandHandler/index.js"

const cmd = new Command({ name: "test-normal" })

cmd.addArgument("boolean", (player, value) => {
	player.sendMessage(`You input the boolean ${value}`)
})

cmd.addArgument("number", (player, value) => {
	player.sendMessage(`You input the number ${value}`)
})

cmd.addArgument("string", (player, value) => {
	player.sendMessage(`You input the string ${value}`)
})

Command.register(cmd)