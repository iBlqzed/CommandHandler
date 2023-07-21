import { Player, ItemType } from "@minecraft/server";
export declare class Command {
    private static cache;
    static register(command: Command): void;
    protected data: CommandData;
    constructor(info: CommandInfo);
    addArgument<T extends keyof CommandArguments>(type: T, callback?: (player: Player, value: CommandArguments[T]) => void): Argument<T>;
    addOptionalArgument<T extends keyof CommandArguments>(type: T, callback?: (player: Player, value: CommandArguments[T]) => void): Argument<T>;
    addSubCommand(command: Command): this;
}
declare class Argument<T extends keyof CommandArguments, Prev extends Argument<keyof CommandArguments, any> = undefined> {
    type: T;
    optional: boolean;
    protected callback?: (player: Player, data: GetArgument<Argument<T, Prev>>) => void;
    protected nextArg?: Argument<keyof CommandArguments>;
    constructor(type: T, optional?: boolean, callback?: (player: Player, data: GetArgument<Argument<T, Prev>>) => void);
    chainArgument<K extends keyof CommandArguments>(type: K, optional?: boolean, callback?: (player: Player, data: GetArgument<ArgumentArrayToChain<ReverseArgumentArray<Argument<K, this>>>>) => void): Argument<K, this>;
    protected execute(player: Player, arg: string, other: string[], prevResult?: any): boolean;
}
declare type ArgumentArrayToChain<T extends (keyof CommandArguments)[]> = T extends [infer Head, ...infer Rest] ? Argument<Head, ArgumentArrayToChain<Rest>> : undefined;
declare type GetArgument<T extends Argument<keyof CommandArguments, any>> = T extends Argument<infer E, infer P> ? P extends undefined ? CommandArguments[E] : FlattenArray<[CommandArguments[E], GetArgument<P>]> : T;
declare type FlattenArray<T extends any[]> = T extends [infer Head, infer Rest] ? [...(Head extends any[] ? FlattenArray<Head> : [Head]), ...(Rest extends any[] ? FlattenArray<Rest> : [Rest])] : [];
declare type ReverseArgumentArray<T extends Argument<keyof CommandArguments, any>> = T extends Argument<infer P, infer K> ? K extends undefined ? [P] : [...ReverseArgumentArray<K>, P] : T;
declare type CommandInfo = {
    name: string;
    permission?: (player: Player) => boolean;
    callback?: (player: Player, args: string[]) => void;
};
declare type CommandData = CommandInfo & {
    arguments: Argument<keyof CommandArguments>[];
    subCommands: Record<string, CommandData>;
};
declare type CommandArguments = {
    string: string;
    number: number;
    boolean: boolean;
    player: Player;
    offlinePlayer: string;
    item: ItemType;
    all: string;
};
export {};
