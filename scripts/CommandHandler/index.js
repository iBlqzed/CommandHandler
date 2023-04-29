import { world } from "@minecraft/server";
const commandPrefix = "-";
export class Command {
    constructor(info) {
        this.data = {
            name: "",
            arguments: [],
            chainedArguments: [],
            subCommands: {}
        };
        this.data.name = info.name.toLowerCase();
        this.data.permission = info.permission ?? (() => true);
    }
    static register(command) {
        this.cache[command.data.name] = command.data;
    }
    addArgument(type, callback) {
        this.data.arguments[this.data.arguments.length] = [type, callback];
        return this;
    }
    //@ts-ignore
    addChainedArguments(types, callback) {
        this.data.chainedArguments[this.data.chainedArguments.length] = [types, callback];
        return this;
    }
    addSubCommand(command) {
        this.data.subCommands[command.data.name] = command.data;
        return this;
    }
}
Command.cache = {};
world.events.beforeChat.subscribe(ev => {
    if (!ev.message.startsWith(commandPrefix))
        return;
    ev.cancel = true;
    const player = ev.sender;
    const [name, ...args] = ev.message.slice(commandPrefix.length).trim().split(/\s+/g);
    //@ts-ignore
    let data = Command.cache[name.toLowerCase()];
    let nextArg = args.shift();
    if (!data)
        return player.sendMessage(`§cInvalid command!`);
    if (!data.permission(player))
        return player.sendMessage(`§cInvalid command permission!`);
    while (true) {
        const sub = data.subCommands[nextArg ?? ''];
        if (sub) {
            if (!sub.permission(player))
                return player.sendMessage(`§cInvalid sub-command permission for command ${sub.name}!`);
            data = sub;
            nextArg = args.shift();
            continue;
        }
        let result = null;
        const oldArg = nextArg;
        let found = false;
        for (const chainedArg of data.chainedArguments) {
            const results = [];
            let i = 0;
            for (const arg of chainedArg[0]) {
                if (arg === "all") {
                    if (i - 1 === args.length)
                        break;
                    results.push(args.slice(i - 1).join(' '));
                    break;
                }
                switch (arg) {
                    case "string": {
                        if (!nextArg) {
                            if (results.length !== 0)
                                player.sendMessage(`§cInvalid argument! You need to input a string afterwards!`);
                            continue;
                        }
                        results.push(nextArg);
                        break;
                    }
                    case "number": {
                        if (!nextArg) {
                            if (results.length !== 0)
                                player.sendMessage(`§cInvalid argument! You need to input a number afterwards!`);
                            continue;
                        }
                        const num = Number(nextArg);
                        if (isNaN(num)) {
                            if (results.length !== 0)
                                player.sendMessage(`§cInvalid argument! You need to input a number afterwards!`);
                            break;
                        }
                        results.push(num);
                        break;
                    }
                    case "boolean": {
                        if (!nextArg) {
                            if (results.length !== 0)
                                player.sendMessage(`§cInvalid argument! You need to input a boolean (true or false) afterwards!`);
                            continue;
                        }
                        const v = nextArg.toLowerCase();
                        if (!["true", "false"].includes(v)) {
                            if (results.length !== 0)
                                player.sendMessage(`§cInvalid argument! You need to input a boolean (true or false) afterwards!`);
                            break;
                        }
                        results.push(v === "true" ? true : false);
                        break;
                    }
                    case "player": {
                        if (!nextArg || !nextArg.startsWith('"')) {
                            player.sendMessage(`§cInvalid argument ${nextArg ?? "[Nothing]"} in command ${data.name}! Player name needs to start with "!`);
                            break;
                        }
                        let res = "", t = 0;
                        const oldI = i;
                        while (nextArg) {
                            if (nextArg.endsWith('"')) {
                                result = [...world.getPlayers({ name: (res + nextArg).slice(1, -1) })][0];
                                if (!result) {
                                    player.sendMessage(`§cInvalid argument ${res + nextArg} in command ${data.name}! Player is not online!`);
                                }
                                else
                                    results.push(result);
                                break;
                            }
                            res += nextArg + " ";
                            nextArg = args[t++];
                            i++;
                        }
                        if (!nextArg) {
                            player.sendMessage(`§cInvalid argument ${res}in command ${data.name}! Player name needs to end with "!`);
                            i = oldI - 1;
                        }
                        break;
                    }
                }
                nextArg = args[i++];
            }
            i = 0;
            nextArg = oldArg;
            if (results.length !== chainedArg[0].length)
                continue;
            chainedArg[1](player, results);
            found = true;
            break;
        }
        if (found)
            return;
        if (data.arguments.length === 0)
            break;
        for (const arg of data.arguments) {
            if (arg[0] === "all") {
                arg[1](player, [nextArg, ...args].join(' '));
                result = true;
                break;
            }
            switch (arg[0]) {
                case "string": {
                    if (!nextArg)
                        continue;
                    result = nextArg;
                    break;
                }
                case "number": {
                    if (!nextArg)
                        continue;
                    const num = Number(nextArg);
                    if (isNaN(num)) {
                        break;
                    }
                    result = num;
                    break;
                }
                case "boolean": {
                    if (!nextArg)
                        continue;
                    const v = nextArg.toLowerCase();
                    if (!["true", "false"].includes(v)) {
                        break;
                    }
                    result = v === "true" ? true : false;
                    break;
                }
                case "player": {
                    if (!nextArg || !nextArg.startsWith('"')) {
                        player.sendMessage(`§cInvalid argument ${nextArg ?? "[Nothing]"} in command ${data.name}! Player name needs to start with "!`);
                        break;
                    }
                    let res = "", i = 0;
                    const oldArg = nextArg;
                    while (nextArg) {
                        if (nextArg.endsWith('"')) {
                            result = [...world.getPlayers({ name: (res + nextArg).slice(1, -1) })][0];
                            if (!result) {
                                player.sendMessage(`§cInvalid argument ${res + nextArg} in command ${data.name}! Player is not online!`);
                                result = "";
                            }
                            break;
                        }
                        res += nextArg + " ";
                        nextArg = args[i++];
                    }
                    if (result === null) {
                        player.sendMessage(`§cInvalid argument ${res}in command ${data.name}! Player name needs to end with "!`);
                        result = null;
                    }
                    if (result === "")
                        result = null;
                    nextArg = oldArg;
                    break;
                }
            }
            if (result === null)
                continue;
            arg[1](player, result);
            break;
        }
        if (result === null)
            player.sendMessage(`§cInvalid argument ${nextArg ?? "[Nothing]"}`);
        break;
    }
});
