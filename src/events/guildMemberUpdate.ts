import { GuildMember } from "discord.js";
import { IEvent } from "my-module";
import { ExperienceService } from "../helpers/ExperienceService";
import { CONFIG } from "../config";
import { Core } from "../helpers/Core";

export default class Event implements IEvent {
    readonly name = "guildMemberUpdate";

    async execute(client: Core, _: GuildMember, newMember: GuildMember) {
        if (newMember.guild.id !== CONFIG.SYSTEM.GUILD_ID || newMember.user.bot || !client.checkStaff(newMember.id)) return;
        ExperienceService.sync(newMember);
    }
}
