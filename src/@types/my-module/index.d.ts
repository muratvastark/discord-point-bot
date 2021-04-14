declare module "my-module" {
    import { Document } from "mongoose";
    import { Message } from "discord.js";
    import { Core } from "../../helpers/Core";

    export interface IDocument {
        name: string;
        value: number;
    }

    export interface ITask {
        ID: string;
        POINT: number;
    }

    export interface IChannel {
        NAME: string;
        POINT: number;
        ID: string;
        TYPE: "messages" | "voices";
    }

    export interface ICommand {
        usages: string[];
        execute: (commandArgs: CommandArgs) => Promise<unknown>;
    }

    export interface IEvent {
        name: string;
        execute: (client: Core, ...args: any[]) => Promise<void>;
    }

    export interface CommandArgs {
        client: Core;
        message: Message;
        args: string[];
    }

    export interface IObject {
        [key: string]: number;
    }

    export interface IModel extends Document {
        id: string;
        points: number;
        invites: number;
        inviter: string;
        voices: {
            channels: IObject;
            categories: IObject;
            total: number;
        };
        messages: {
            channels: IObject;
            categories: IObject;
            total: number;
        };
    }
}
