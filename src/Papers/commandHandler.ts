import { Player, world } from "mojang-minecraft"

const commandPrefix = '?'

export class Command {
    static registeredCommands: commandData[] = []
    protected registeredCommand: commandData
    protected arguments: Array<{ index: number, type: string }> = []
    /**
     * Create a new command!
     * @example const myCommand = new Command({
     * name: 'test', //The name of the command
     * description: 'This is just a test command', //The description of the command
     * aliases: ['test1', 'test2'], //Aliases of the command
     * permissions: ['Admin'] //Tags you need to have to run the command
     * })
     */
    constructor(commandInfo: commandInfo) {
        this.registeredCommand = {
            name: commandInfo.name.toLowerCase(),
            description: commandInfo.description,
            aliases: commandInfo.aliases?.map(aL => aL.toLowerCase()),
            permissions: commandInfo.permissions,
            callback: null,
            arguments: null
        }
    }
    /**
     * Add a dynamic argument
     * @param {number} index Index of the argument to set the type to
     * @param {keyof argumentTypes} type The type of the argument
     */
    addDynamicArgument(index: number, type: keyof argumentTypes) {
        this.arguments.push({ index, type })
    }
    /**
     * Run code when the command is ran
     * @param {(player: Player, args: { type: string, value: any }[]) => void} callback Code to run when the command is ran
     */
    callback(callback: (player: Player, args: { type: string, value: any }[]) => void) {
        this.registeredCommand = Object.assign(this.registeredCommand, { callback })
    }
    /**
     * Register the command
     */
    register() {
        Command.registeredCommands.push(Object.assign(this.registeredCommand, { arguments: this.arguments }))
    }
}

world.events.beforeChat.subscribe(data => {
    if (!data.message.startsWith(commandPrefix)) return
    data.cancel = true
    const command = Command.registeredCommands.find(cmd => cmd.name === data.message.slice(commandPrefix.length, cmd.name.length + commandPrefix.length))
    if (!command) return broadcastMessage(`§cInvalid command!`)
    const args = data.message.slice(command.name.length + commandPrefix.length).trim().split(/\s+/),
        sortedArgs = command.arguments?.sort((a, b) => a.index - b.index),
        callbackArgs: { type: keyof argumentTypes, value: any }[] = []
    let foundArg = true, argTest = 1
    for (let i = 0; i < sortedArgs[sortedArgs.length - 1].index + 1; i++) {
        const argsData = command.arguments.filter((arg) => arg.index === i)
        const argValue = args[i] ?? undefined
        if (argsData.length === 0) { if (argValue !== '' && argValue !== undefined) { callbackArgs.push({ type: 'any', value: argValue }) } }
        else argsData.forEach(arg => {
            if (arg.type === 'number') { if (Number(argValue)) callbackArgs.push({ type: 'number', value: Number(argValue) }) }
            else if (arg.type === 'boolean') { if (argValue === 'true' || argValue === 'false') callbackArgs.push({ type: 'boolean', value: argValue === 'true' ? true : false }) }
            else if (arg.type === 'any') { if (argValue !== '' && argValue !== undefined) callbackArgs.push({ type: 'any', value: argValue }) }
        })
        if (argTest !== callbackArgs.length) {
            foundArg = false
            broadcastMessage(`§c${argValue === '' || argValue === undefined ? '[Nothing]' : argValue} is not of type ${JSON.stringify(argsData.map(arg => arg.type)) !== '[]' ? JSON.stringify(argsData.map(arg => arg.type)).slice(2, -2).replaceAll('","', ", ") : 'any'}`, data.sender)
            break
        }
        argTest++
    }
    if (foundArg) command.callback(data.sender, callbackArgs)
})

interface argumentTypes {
    create: string
    set: string
    remove: string
    invite: string
    player: Player
    number: number
    boolean: boolean
    any: any
}

interface commandData extends commandInfo {
    callback?: (player: Player, args: { type: keyof argumentTypes, value: any }[]) => void
    arguments?: { index: number, type: keyof argumentTypes }[]
}

interface commandInfo {
    /**
     * The name of the command
     */
    name: string
    /**
     * The description of the command
     */
    description?: string
    /**
     * Aliases of the command
     */
    aliases?: string[]
    /**
     * Tags you need to have to run the command
     */
    permissions?: string[]
}

/**
 * Broadcast a message (or send it to a player)
 * @param {string} message Message to broadcast
 * @param {Player|Player[]} player Player(s) to send the message to
 * @example broadcastMessage('This message was sent to everyone!')
 */
function broadcastMessage(message: string, player?: Player | Player[]) {
    if (!player) world.getDimension('overworld').runCommand(`tellraw @a ${JSON.stringify({ rawtext: [{ text: message }] })}`)
    else if (player instanceof Player) player.runCommand(`tellraw @a ${JSON.stringify({ rawtext: [{ text: message }] })}`)
    else player.forEach(pL => pL.runCommand(`tellraw @a ${JSON.stringify({ rawtext: [{ text: message }] })}`))
}

const myCommand = new Command({
    name: 'test'
})
myCommand.addDynamicArgument(0, 'any')
myCommand.addDynamicArgument(3, 'boolean')
myCommand.callback((player, args) => {
    console.warn(args[0].value) //Will warn either "true" or "false"
})
myCommand.register()