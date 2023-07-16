import { Player } from "@minecraft/server";
export declare class Command {
    private static cache;
    static register(command: Command): void;
    protected data: CommandData;
    constructor(info: CommandInfo);
    addArgument<T extends keyof CommandArguments>(type: T, callback: (player: Player, value: CommandArguments[T]) => void): this;
    addChainedArguments<T = Array<keyof CommandArguments>>(types: T, callback: (player: Player, args: KeyArrayToTypeArray<T>) => void): this;
    addSubCommand(command: Command): this;
}
declare type CommandArguments = {
    string: string;
    number: number;
    boolean: boolean;
    player: Player;
    all: string;
};
declare type KeyArrayToTypeArray<K extends any[]> = {
    [P in keyof K]: CommandArguments[K[P]];
};
declare type CommandInfo = {
    name: string;
    permission?: (player: Player) => boolean;
    callback?: (player: Player, args: string[]) => void;
};
declare type CommandData = CommandInfo & {
    chainedArguments: Array<[Array<keyof CommandArguments>, (...args: any[]) => void]>;
    arguments: Array<[keyof CommandArguments, (...args: any[]) => void]>;
    subCommands: Record<string, CommandData>;
};
export {};
