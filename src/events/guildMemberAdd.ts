import { Collection, GuildMember } from "discord.js";
import { Model } from "../helpers/Model";
import { IEvent } from "my-module";
import { CONFIG } from "../config";
import { Core } from "../helpers/Core";

export default class Event implements IEvent {
    readonly name = "guildMemberAdd";

    async execute(client: Core, member: GuildMember) {
        if (member.guild.id !== CONFIG.SYSTEM.GUILD_ID || member.user.bot) return;

        const isFake = (Date.now() - member.user.createdTimestamp) / (1000 * 60 * 60 * 24) <= 3 ? true : false;
        const beforeInvites = (client.invites.get(member.guild.id) || new Collection()).clone();

        member.guild.fetchInvites().then(async (afterInvites) => {
            const invite =
                afterInvites.find((inv) => beforeInvites.has(inv.code) && beforeInvites.get(inv.code)?.uses! < inv.uses!) ||
                beforeInvites.find((inv) => !afterInvites.has(inv.code));

            client.invites.set(member.guild.id, afterInvites);

            if (invite && invite.inviter && !client.checkStaff(invite.inviter.id)) {
                Model.updateOne(
                    { id: invite.inviter.id },
                    { $inc: { invites: 1, points: CONFIG.SYSTEM.INVITE_XP } },
                    { upsert: true }
                ).exec();
                Model.updateOne({ id: member.id }, { $set: { inviter: invite.inviter.id } }, { upsert: true }).exec();
            }
        });
    }
}
