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
        this.data.callback = info.callback ?? (() => true);
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
const argTypes = {};
world.beforeEvents.chatSend.subscribe(ev => {
    if (!ev.message.startsWith(commandPrefix))
        return;
    ev.setTargets([]);
    ev.sendToTargets = true;
});
world.afterEvents.chatSend.subscribe(ev => {
    if (!ev.message.startsWith(commandPrefix))
        return;
    const player = ev.sender;
    const [name, ...args] = ev.message.slice(commandPrefix.length).trim().split(/\s+/g);
    //@ts-ignore
    let data = Command.cache[name.toLowerCase()];
    let nextArg = args.shift();
    if (!data)
        return player.sendMessage(`§cInvalid command!`);
    if (!data.permission(player))
        return player.sendMessage(`§cInvalid command permission!`);
    data.callback(player, [nextArg, ...args]);
    while (true) {
        const sub = data.subCommands[nextArg ?? ''];
        if (sub) {
            if (!sub.permission(player))
                return player.sendMessage(`§cInvalid sub-command permission for command ${sub.name}!`);
            data = sub;
            nextArg = args.shift();
            continue;
        }
        const oldArg = nextArg;
        let found = false;
        for (const chainedArg of data.chainedArguments) {
            const results = [];
            let argsCopy = args.map(v => v);
            for (const arg of chainedArg[0]) {
                if (!nextArg)
                    break;
                const [result, v] = (argTypes[arg](nextArg, argsCopy, player) ?? [undefined, undefined]);
                if (!v)
                    break;
                results.push(result);
                argsCopy = v;
                nextArg = v.shift();
            }
            nextArg = oldArg;
            if (results.length !== chainedArg[0].length)
                continue;
            chainedArg[1](player, results);
            found = true;
            break;
        }
        if (found)
            return;
        if (data.arguments.length === 0) {
            if (!found)
                player.sendMessage(`§cInvalid argument ${nextArg ?? "[Nothing]"}, expected ${data.chainedArguments.map(v => v[0].join(", ")).join(" or ")}`);
            break;
        }
        if (!nextArg || nextArg === "") {
            player.sendMessage(`§cInvalid argument [Nothing], expected ${data.arguments.map(v => v[0]).join(", ")}`);
            break;
        }
        for (const arg of data.arguments) {
            const [result, v] = (argTypes[arg[0]](nextArg, args, player) ?? [undefined, undefined]);
            if (!v)
                continue;
            arg[1](player, result);
            found = true;
            break;
        }
        if (!found)
            player.sendMessage(`§cInvalid argument ${nextArg}, expected ${data.arguments.map(v => v[0]).join(", ")}`);
        break;
    }
});
function addArgument(type, callback) {
    //@ts-ignore
    argTypes[type] = callback;
}
addArgument("all", (nextArg, args) => {
    return [[nextArg, ...args].join(" "), []];
});
addArgument("string", (nextArg, args) => {
    if (nextArg.startsWith('"')) {
        const argsCopy = new Proxy(args, {});
        let currentArg = nextArg, result = "";
        while (currentArg) {
            result += " " + currentArg;
            if (result.endsWith('"'))
                return [result.slice(1, -1), argsCopy];
            currentArg = argsCopy.shift();
        }
    }
    return [nextArg, args];
});
addArgument("number", (nextArg, args) => {
    const v = Number(nextArg);
    if (isNaN(v))
        return;
    return [v, args];
});
addArgument("boolean", (nextArg, args) => {
    const v = nextArg.toLowerCase();
    if (!["true", "false"].includes(v))
        return;
    return [v[0] === "t" ? true : false, args];
});
addArgument("player", (nextArg, args, player) => {
    const end = (msg) => {
        player.sendMessage(`§c${msg}`);
        return [undefined, undefined];
    };
    if (!nextArg.startsWith('"'))
        return end(`Invalid argument ${nextArg ?? "[Nothing]"}! Player name needs to start with "!`);
    let currentArg = nextArg, result = "";
    while (currentArg) {
        result += currentArg;
        if (result.endsWith('"')) {
            const player = world.getPlayers({ name: result.slice(1, -1) })[0];
            if (!player)
                return end(`Player ${result} not online!`);
            return [player, args];
        }
        args.shift();
    }
    return end(`Player name needs to end with a "!`);
});
