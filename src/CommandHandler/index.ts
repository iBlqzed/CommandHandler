import { world, Player } from "@minecraft/server"

const commandPrefix = "-"

export class Command {
	private static cache: Record<string, CommandData> = {}

	static register(command: Command) {
		this.cache[command.data.name] = command.data
	}

	protected data: CommandData = {
		name: "",
		arguments: [],
		chainedArguments: [],
		subCommands: {}
	}

	constructor(info: CommandInfo) {
		this.data.name = info.name.toLowerCase()
		this.data.permission = info.permission ?? (() => true)
		this.data.callback = info.callback ?? (() => true)
	}

	addArgument<T extends keyof CommandArguments>(type: T, callback: (player: Player, value: CommandArguments[T]) => void): this {
		this.data.arguments[this.data.arguments.length] = [type, callback]
		return this
	}

	//@ts-ignore
	addChainedArguments<T = Array<keyof CommandArguments>>(types: T, callback: (player: Player, args: KeyArrayToTypeArray<T>) => void): this {
		this.data.chainedArguments[this.data.chainedArguments.length] = [types as unknown as Array<keyof CommandArguments>, callback]
		return this
	}

	addSubCommand(command: Command): this {
		this.data.subCommands[command.data.name] = command.data
		return this
	}
}

const argTypes: Partial<{ [K in keyof CommandArguments]: (nextArg: string, args: string[], player: Player) => [CommandArguments[K], string[]] | undefined }> = {}

type CommandArguments = {
	string: string
	number: number
	boolean: boolean
	player: Player
	all: string
}

type KeyArrayToTypeArray<K extends any[]> = {
	[P in keyof K]: CommandArguments[K[P]]
}

type CommandInfo = {
	name: string
	permission?: (player: Player) => boolean
	callback?: (player: Player, args: string[]) => void
}

type CommandData = CommandInfo & {
	chainedArguments: Array<[Array<keyof CommandArguments>, (...args: any[]) => void]>
	arguments: Array<[keyof CommandArguments, (...args: any[]) => void]>
	subCommands: Record<string, CommandData>
}

world.beforeEvents.chatSend.subscribe(ev => {
	if (!ev.message.startsWith(commandPrefix)) return
	ev.setTargets([])
	ev.sendToTargets = true
})

world.afterEvents.chatSend.subscribe(ev => {
	if (!ev.message.startsWith(commandPrefix)) return
	const player = ev.sender
	const [name, ...args] = ev.message.slice(commandPrefix.length).trim().split(/\s+/g)
	//@ts-ignore
	let data = Command.cache[name.toLowerCase()]
	let nextArg = args.shift()
	if (!data) return player.sendMessage(`§cInvalid command!`)
	if (!data.permission(player)) return player.sendMessage(`§cInvalid command permission!`)
	data.callback(player, [nextArg, ...args])
	while (true) {
		const sub = data.subCommands[nextArg ?? '']
		if (sub) {
			if (!sub.permission(player)) return player.sendMessage(`§cInvalid sub-command permission for command ${sub.name}!`)
			data = sub
			nextArg = args.shift()
			continue
		}
		let result = null
		const oldArg = nextArg
		let found = false
		for (const chainedArg of data.chainedArguments) {
			const results = []
			let i = 0
			for (const arg of chainedArg[0]) {
				if (arg === "all") {
					if (i - 1 === args.length) break
					results.push(args.slice(i - 1).join(' '))
					break
				}
				switch (arg) {
					case "string": {
						if (!nextArg) {
							if (results.length !== 0) player.sendMessage(`§cInvalid argument! You need to input a string afterwards!`)
							continue
						}
						results.push(nextArg)
						break
					}
					case "number": {
						if (!nextArg) {
							if (results.length !== 0) player.sendMessage(`§cInvalid argument! You need to input a number afterwards!`)
							continue
						}
						const num = Number(nextArg)
						if (isNaN(num)) {
							if (results.length !== 0) player.sendMessage(`§cInvalid argument! You need to input a number afterwards!`)
							break
						}
						results.push(num)
						break
					}
					case "boolean": {
						if (!nextArg) {
							if (results.length !== 0) player.sendMessage(`§cInvalid argument! You need to input a boolean (true or false) afterwards!`)
							continue
						}
						const v = nextArg.toLowerCase()
						if (!["true", "false"].includes(v)) {
							if (results.length !== 0) player.sendMessage(`§cInvalid argument! You need to input a boolean (true or false) afterwards!`)
							break
						}
						results.push(v === "true" ? true : false)
						break
					}
					case "player": {
						if (!nextArg || !nextArg.startsWith('"')) {
							player.sendMessage(`§cInvalid argument ${nextArg ?? "[Nothing]"} in command ${data.name}! Player name needs to start with "!`)
							break
						}
						let res = "", t = 0
						const oldI = i
						while (nextArg) {
							if (nextArg.endsWith('"')) {
								result = [...world.getPlayers({ name: (res + nextArg).slice(1, -1) })][0]
								if (!result) {
									player.sendMessage(`§cInvalid argument ${res + nextArg} in command ${data.name}! Player is not online!`)
								} else results.push(result)
								break
							}
							res += nextArg + " "
							nextArg = args[t++]
							i++
						}
						if (!nextArg) {
							player.sendMessage(`§cInvalid argument ${res}in command ${data.name}! Player name needs to end with "!`)
							i = oldI - 1
						}
						break
					}
				}
				nextArg = args[i++]
			}
			i = 0
			nextArg = oldArg
			if (results.length !== chainedArg[0].length) continue
			chainedArg[1](player, results)
			found = true
			break
		}
		if (found) return
		if (data.arguments.length === 0) break
		if (!nextArg || nextArg === "") {
			player.sendMessage(`§cInvalid argument [Nothing], expected ${data.arguments.map(v => v[0]).join(", ")}`)
			break
		}
		for (const arg of data.arguments) {
			const [result, v] = (argTypes[arg[0]](nextArg, args, player) ?? [undefined, undefined])
			if (!v) continue
			arg[1](player, result)
			found = true
			break
		}
		if (!found) player.sendMessage(`§cInvalid argument ${nextArg}, expected ${data.arguments.map(v => v[0]).join(", ")}`)
		break
	}
})

function addArgument<T extends keyof CommandArguments>(type: T, callback: (nextArg: string, args: string[], player: Player) => [CommandArguments[T], string[], boolean?] | undefined) {
	//@ts-ignore
	argTypes[type] = callback
}


addArgument("all", (nextArg, args) => {
	return [[nextArg, ...args].join(" "), []]
})

addArgument("string", (nextArg, args) => {
	if (nextArg.startsWith('"')) {
		const argsCopy = new Proxy(args, {})
		let currentArg = nextArg, result = ""
		while (currentArg) {
			result += " " + currentArg
			if (result.endsWith('"')) return [result.slice(1, -1), argsCopy]
			currentArg = argsCopy.shift()
		}
	}
	return [nextArg, args]
})

addArgument("number", (nextArg, args) => {
	const v = Number(nextArg)
	if (isNaN(v)) return
	return [v, args]
})

addArgument("boolean", (nextArg, args) => {
	const v = nextArg.toLowerCase()
	if (!["true", "false"].includes(v)) return
	return [v[0] === "t" ? true : false, args]
})

addArgument("player", (nextArg, args, player) => {
	const end = (msg: string): [undefined, undefined] => {
		player.sendMessage(`§c${msg}`)
		return [undefined, undefined]
	}
	if (!nextArg.startsWith('"')) return end(`Invalid argument ${nextArg ?? "[Nothing]"}! Player name needs to start with "!`)
	let currentArg = nextArg, result = ""
	while (currentArg) {
		result += currentArg
		if (result.endsWith('"')) {
			const player = world.getPlayers({ name: result.slice(1, -1) })[0]
			if (!player) return end(`Player ${result} not online!`)
			return [player, args]
		}
		args.shift()
	}
	return end(`Player name needs to end with a "!`)
})