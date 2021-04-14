import { GuildMember } from "discord.js";
import { Model } from "../helpers/Model";
import { IEvent } from "my-module";
import { CONFIG } from "../config";
import { Core } from "../helpers/Core";

export default class Event implements IEvent {
    readonly name = "guildMemberAdd";

    async execute(_: Core, member: GuildMember) {
        if (member.guild.id !== CONFIG.SYSTEM.GUILD_ID || member.user.bot) return;

        const memberData = await Model.findOne({ id: member.id }).select("inviter").exec();
        if (memberData && memberData.inviter) {
            Model.updateOne(
                { id: memberData.inviter },
                { $inc: { invites: -1, points: -CONFIG.SYSTEM.INVITE_XP } },
                { upsert: true }
            );
        }
    }
}
