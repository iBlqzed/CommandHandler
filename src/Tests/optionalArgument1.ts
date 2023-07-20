import { Command } from "../CommandHandler/index.js"

const cmd = new Command({ name: "test-optional1" })

cmd.addOptionalArgument("all", (player, value) => {
	if (value) player.sendMessage(`The argument is optional, and you entered ${value}`)
	else player.sendMessage(`The argument is optional, and you entered nothing!`)
})

Command.register(cmd)