import { GuildChannel, Message } from "discord.js";
import { ICommand, IEvent } from "my-module";
import { ExperienceService } from "../helpers/ExperienceService";
import { CONFIG } from "../config";
import { Core } from "../helpers/Core";

export default class Event implements IEvent {
    readonly name = "message";
    private categories = CONFIG.SYSTEM.CHANNELS.filter((category) => category.TYPE === "messages").map(
        (category) => category.ID
    );

    async execute(client: Core, message: Message) {
        if (!message.guild || message.guild.id !== CONFIG.SYSTEM.GUILD_ID || message.author.bot) return;

        if (message.content.startsWith(CONFIG.BOT.PREFIX)) {
            const args = message.content.slice(CONFIG.BOT.PREFIX.length).trim().split(" ");
            const commandName = args.shift()?.toLowerCase() as string;
            const command = client.commands.find((alias: ICommand) => alias.usages.includes(commandName));

            if (command) command.execute({ client, message, args });
        } else {
            const channel = message.channel as GuildChannel;
            if (
                !channel.parentID ||
                !this.categories.includes(channel.parentID) ||
                !client.checkStaff(message.author.id) === true
            )
                return;

            ExperienceService.addPoint(message.member!, channel, "messages", 1);
        }
    }
}
