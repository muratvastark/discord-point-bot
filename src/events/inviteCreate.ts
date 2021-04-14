import { Invite } from "discord.js";
import { IEvent } from "my-module";
import { CONFIG } from "../config";
import { Core } from "../helpers/Core";

export default class Event implements IEvent {
    readonly name = "inviteCreate";

    async execute(client: Core, invite: Invite) {
        if (invite.guild?.id !== CONFIG.SYSTEM.GUILD_ID) return;

        const guildData = client.invites.get(invite.guild?.id);
        guildData?.set(invite.code, invite);
        client.invites.set(invite.guild.id, guildData!);
    }
}
