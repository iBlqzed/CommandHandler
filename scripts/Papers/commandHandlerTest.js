import { Player, world } from "mojang-minecraft";
const commandPrefix = '?';
export class Command {
    /**
     * Create a new command!
     * @example const myCommand = new Command({
     * name: 'test', //The name of the command
     * description: 'This is just a test command', //The description of the command
     * aliases: ['test1', 'test2'], //Aliases of the command
     * permissions: ['Admin'] //Tags you need to have to run the command
     * })
     */
    constructor(commandInfo) {
        this.arguments = [];
        this.registeredCommand = {
            name: commandInfo.name.toLowerCase(),
            description: commandInfo.description,
            aliases: commandInfo.aliases?.map(aL => aL.toLowerCase()),
            permissions: commandInfo.permissions,
            callback: null,
            arguments: null
        };
    }
    /**
     * Add a argument
     * @param {number} index Index of the argument to set the type to
     * @param {keyof { create: string, set: string, remove: string, invite: string, player: Player, number: number, boolean: boolean, any: any }} type The type of the argument
     */
    addArgument(index, type) {
        this.arguments.push({ index, type });
    }
    /**
     * Run code when the command is ran
     * @param {(player: Player, args: { type: string, value: any }[]) => void} callback Code to run when the command is ran
     */
    callback(callback) {
        this.registeredCommand = Object.assign(this.registeredCommand, { callback });
    }
    /**
     * Register the command
     */
    register() {
        Command.registeredCommands.push(Object.assign(this.registeredCommand, { arguments: this.arguments }));
    }
}
Command.registeredCommands = [];
const create = ['create', 'c', 'add', 'make'], remove = ['remove', 'delete', 'r'], set = ['set', 'change'], invite = ['invite', 'inv', 'i'];
world.events.beforeChat.subscribe(data => {
    if (!data.message.startsWith(commandPrefix))
        return;
    data.cancel = true;
    const command = Command.registeredCommands.find(cmd => cmd.name === data.message.slice(commandPrefix.length, cmd.name.length + commandPrefix.length));
    if (!command)
        return broadcastMessage(`§cInvalid command!`);
    const sortedArgs = command.arguments?.sort((a, b) => a.index - b.index), callbackArgs = [];
    let foundArg = true, argTest = 1, args = data.message.slice(command.name.length + commandPrefix.length).trim().split(/\s+/), playerCheck = { value: '', check: false }, loopAmount = sortedArgs[sortedArgs.length - 1].index + 1, indexPlus = 0;
    for (let i = 0; i < loopAmount; i++) {
        console.warn(i);
        const argsData = command.arguments.filter((arg) => arg.index === i);
        const argValue = args[i + indexPlus] ?? undefined;
        if (argsData.find(value => value.type === 'player'))
            playerCheck.check = true;
        if (argsData.length === 0) {
            if (argValue !== '' && argValue !== undefined) {
                callbackArgs.push({ type: 'any', value: argValue });
            }
        }
        else
            argsData.forEach(arg => {
                if (arg.type === 'number') {
                    if (Number(argValue))
                        callbackArgs.push({ type: 'number', value: Number(argValue) });
                }
                if (arg.type === 'boolean') {
                    if (argValue === 'true' || argValue === 'false')
                        callbackArgs.push({ type: 'boolean', value: argValue === 'true' ? true : false });
                }
                if (arg.type === 'create') {
                    if (create.includes(argValue))
                        callbackArgs.push({ type: 'create', value: argValue });
                }
                if (arg.type === 'remove') {
                    if (remove.includes(argValue))
                        callbackArgs.push({ type: 'remove', value: argValue });
                }
                if (arg.type === 'set') {
                    if (set.includes(argValue))
                        callbackArgs.push({ type: 'set', value: argValue });
                }
                if (arg.type === 'invite') {
                    if (invite.includes(argValue))
                        callbackArgs.push({ type: 'invite', value: argValue });
                }
                if (arg.type === 'any') {
                    if (argValue !== '' && argValue !== undefined)
                        callbackArgs.push({ type: 'any', value: argValue });
                }
            });
        if (argTest !== callbackArgs.length) {
            if (playerCheck.check) {
                playerCheck.check = false;
                if (!argValue?.startsWith('"')) {
                    broadcastMessage(`§cA player's name must start with a §4"§c!`, data.sender);
                    foundArg = false;
                    break;
                }
                let testValue = args.filter((e, index) => index >= i).join(' ').slice(1);
                testValue = testValue.slice(0, testValue.includes('"') ? testValue.indexOf('"') : 0);
                if (testValue === '') {
                    broadcastMessage(`§cA player's name must end with a §4"§c!`, data.sender);
                    foundArg = false;
                    break;
                }
                if (testValue.length > 20) {
                    broadcastMessage(`§cPlayer's name is too long!`, data.sender);
                    foundArg = false;
                    break;
                }
                callbackArgs.push({ type: 'player', value: testValue });
                testValue.split("").forEach(letter => { if (letter === ' ') {
                    indexPlus++;
                } });
            }
            else {
                foundArg = false;
                broadcastMessage(`§c${argValue === '' || argValue === undefined ? '[Nothing]' : argValue} is not of type ${JSON.stringify(argsData.map(arg => arg.type)) !== '[]' ? JSON.stringify(argsData.map(arg => arg.type)).slice(2, -2).replaceAll('","', ", ") : 'any'}`, data.sender);
                break;
            }
        }
        argTest++;
    }
    if (foundArg)
        command.callback(data.sender, callbackArgs);
});
/**
 * Broadcast a message (or send it to a player)
 * @param {string} message Message to broadcast
 * @param {Player|Player[]} player Player(s) to send the message to
 * @example broadcastMessage('This message was sent to everyone!')
 */
function broadcastMessage(message, player) {
    if (!player)
        world.getDimension('overworld').runCommand(`tellraw @a ${JSON.stringify({ rawtext: [{ text: message }] })}`);
    else if (player instanceof Player)
        player.runCommand(`tellraw @a ${JSON.stringify({ rawtext: [{ text: message }] })}`);
    else
        player.forEach(pL => pL.runCommand(`tellraw @a ${JSON.stringify({ rawtext: [{ text: message }] })}`));
}
