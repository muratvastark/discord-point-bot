import { IEvent } from "my-module";
import { CONFIG } from "../config";
import { Core } from "../helpers/Core";

export default class Event implements IEvent {
    readonly name = "ready";

    async execute(client: Core) {
        const guild = client.guilds.cache.get(CONFIG.SYSTEM.GUILD_ID);
        if (guild) guild.fetchInvites().then((invites) => client.invites.set(guild.id, invites));

        console.log(`[${new Date().toLocaleString()}] ${client.user?.tag} is online!`);
    }
}
