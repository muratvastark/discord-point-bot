import { Client, Collection, Invite, Snowflake } from "discord.js";
import { connect } from "mongoose";
import { CONFIG } from "../config";
import { readdirSync } from "fs";
import { resolve } from "path";
import { ICommand, IEvent } from "my-module";

export class Core extends Client {
    public commands = new Collection<string, ICommand>();
    public invites = new Collection<string, Collection<string, Invite>>();
    public messageCooldowns = new Collection<string, number>();

    constructor() {
        super({
            presence: {
                activity: {
                    name: CONFIG.BOT.STATUS,
                    type: "WATCHING",
                },
            },
        });
    }

    async loadCommands() {
        const files = readdirSync(resolve(__dirname, "..", "commands"));
        for (const fileName of files) {
            const file = (await import(resolve(__dirname, "..", "commands", fileName))).default;
            const command = new file() as ICommand;
            this.commands.set(command.usages[0], command);
        }
    }

    public checkStaff(id: Snowflake): boolean {
        const guild = this.guilds.cache.get(CONFIG.SYSTEM.GUILD_ID);
        if (!guild) return false;

        const member = guild.members.cache.get(id);
        if (!member) return false;

        const minStaffRole = guild.roles.cache.get(CONFIG.SYSTEM.MIN_STAFF_ROLE);
        if (!minStaffRole) return true;

        return member.roles.highest.comparePositionTo(minStaffRole) > 0 && member.hasPermission("ADMINISTRATOR");
    }

    private async loadEvents() {
        const files = readdirSync(resolve(__dirname, "..", "events"));
        for (const fileName of files) {
            const file = (await import(resolve(__dirname, "..", "events", fileName))).default;
            const event = new file() as IEvent;
            this.on(event.name, (...args: unknown[]) => event.execute(this, ...args));
        }
    }

    async connect() {
        await this.loadCommands();
        await this.loadEvents();
        await connect(CONFIG.BOT.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
        });
        return await this.login(CONFIG.BOT.TOKEN);
    }
}
