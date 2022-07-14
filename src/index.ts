import { Player, world } from "mojang-minecraft"
import { Command } from "./Papers/commandHandler"

const myCommand = new Command({
    name: 'broadcast',
    aliases: ['hi']
})
myCommand.callback((player, args) => {
    broadcastMessage(args.map(arg => arg.value).join(' '))
})
myCommand.register()

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