import { Collection, GuildChannel, VoiceState } from "discord.js";
import { IEvent } from "my-module";
import { ExperienceService } from "../helpers/ExperienceService";
import { CONFIG } from "../config";
import { Core } from "../helpers/Core";

export default class Event implements IEvent {
    readonly name = "voiceStateUpdate";
    private categories = CONFIG.SYSTEM.CHANNELS.filter((category) => category.TYPE === "voices").map(
        (category) => category.ID
    );
    private voices = new Collection();

    async execute(client: Core, oldState: VoiceState, newState: VoiceState) {
        const category = newState.channel?.parentID || oldState.channel?.parentID;
        if (
            !oldState.member ||
            oldState.member.guild.id !== CONFIG.SYSTEM.GUILD_ID ||
            oldState.member.user.bot ||
            !category ||
            !this.categories.includes(category) ||
            !client.checkStaff(oldState.id)
        )
            return;

        if (!oldState.channelID && newState.channelID) {
            this.voices.set(oldState.id, Date.now());
            return;
        }

        let userData = this.voices.get(oldState.id);
        if (!userData) {
            userData = Date.now();
            this.voices.set(oldState.id, userData);
        }

        const duration = Date.now() - (userData as number);
        if (oldState.channelID && !newState.channelID) {
            this.voices.delete(oldState.id);
            ExperienceService.addPoint(oldState.member, oldState.channel as GuildChannel, "voices", duration);
        } else if (!oldState.channelID && newState.channelID) {
            this.voices.set(oldState.id, Date.now());
            ExperienceService.addPoint(oldState.member, oldState.channel as GuildChannel, "voices", duration);
        }
    }
}
