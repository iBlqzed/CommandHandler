import { Player, world } from "mojang-minecraft";
import { Command } from "./Papers/commandHandler";

const kickCommand = new Command({ //Defining a new Command() variable
    name: 'kick', //Name of the command
    description: 'Kicks a player', //Description of the command
    permissions: ["Admin"] //Permissions (tags) for the command
})

kickCommand.addArgument(0, "playerOnline") //Adding a playerOnline argument

kickCommand.callback((player, args) => { //Making the command callback
    try { player.runCommand(`kick "${args[0].value}" ${args.length > 1 ? args.filter((e, i) => i > 0).map(value => value.value).join(' ') : ''}`) } catch { broadcastMessage('§cYou can not kick the host!', player) } //Kicking the player defined in argument 1, and adding a reason
})

kickCommand.register() //Registering the command













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