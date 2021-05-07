import { Collection, GuildChannel, VoiceState } from "discord.js";
import { IEvent, IVoice } from "my-module";
import { ExperienceService } from "../helpers/ExperienceService";
import { CONFIG } from "../config";
import { Core } from "../helpers/Core";

export default class Event implements IEvent {
    readonly name = "voiceStateUpdate";
    private readonly categories = CONFIG.SYSTEM.CHANNELS.filter((category) => category.TYPE === "voices").map(
        (category) => category.ID
    );
    private voices = new Collection<string, IVoice>();

    async execute(client: Core, oldState: VoiceState, newState: VoiceState) {
        if (
            !oldState.member || 
            oldState.member.guild.id !== CONFIG.SYSTEM.GUILD_ID ||
            oldState.member.user.bot ||
            newState.selfDeaf ||
            !client.checkStaff(oldState.id)
        )
            return;

        const now = Date.now();

        if (!oldState.channelID && newState.channelID) {
            this.voices.set(oldState.id, {
                channel: newState.channel?.parentID || newState.channelID,
                date: now,
            });
        }
        
        let voice = this.voices.get(oldState.id);
        if (!voice) {
            voice = {
                channel: newState.channel?.parentID || newState.channelID!,
                date: now,
            };
            this.voices.set(oldState.id, voice);
        }

        const diff = now - voice.date;
        if (oldState.channelID && !newState.channelID) {
            this.voices.delete(oldState.id);

            const category = oldState.channel?.parentID;
            if (!category || !this.categories.includes(category)) return;
            ExperienceService.addPoint(oldState.member, oldState.channel as GuildChannel, "voices", diff);
        } else if (oldState.channelID && newState.channelID) {
            this.voices.set(oldState.id, {
                channel: newState.channel?.parentID || newState.channelID,
                date: now
            });

            const category = newState.channel?.parentID;
            if (!category || !this.categories.includes(category)) return;
            ExperienceService.addPoint(oldState.member, oldState.channel as GuildChannel, "voices", diff);
        }
     }
}
