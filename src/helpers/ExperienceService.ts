import { removeProperties } from "remove-properties";
import { GuildChannel, GuildMember, Snowflake, VoiceBroadcast } from "discord.js";
import { CONFIG } from "../config";
import { Model } from "./Model";

export class ExperienceService {
    static getTask(value: number, next: boolean = false) {
        let currentIndex = -1;
        for (let i = 0; i < CONFIG.SYSTEM.TASKS.length; i++) {
            if (value >= CONFIG.SYSTEM.TASKS[i].POINT) currentIndex = i;
        }
        if (next === true) return CONFIG.SYSTEM.TASKS[currentIndex + 1];
        return CONFIG.SYSTEM.TASKS[currentIndex];
    }

    static async addPoint(member: GuildMember, channel: GuildChannel, type: "messages" | "voices", value: number) {
        const pointData = CONFIG.SYSTEM.CHANNELS.find((parent) => parent.ID === channel.parentID && parent.TYPE === type);
        let point = type === "messages" ? pointData?.POINT : 0;
        if (type === "voices") point = Math.round(value / 60000) * pointData?.POINT!;

        let document = await Model.findOne({ id: member.id });
        if (!document) {
            document = new Model({
                id: member.id,
                points: 0,
                invites: 0,
                inviter: null,
                messages: {},
                voices: {},
            });
        }

        document[type].channels = {
            ...document[type].channels,
            [channel.id]: ((document[type].channels || {})[channel.id] || 0) + value,
        };

        document[type].categories = {
            ...document[type].categories,
            [channel?.parentID!]: ((document[type].categories || {})[channel?.parentID!] || 0) + value,
        };

        document[type].total = (document[type].total || 0) + value;
        document.points = (document.points || 0) + (point as number);

        await Model.updateOne({ id: member.id }, removeProperties(document.toJSON(), ["_id"]), { upsert: true });

        const task = this.getTask(document.points);
        if (task && !member.roles.cache.has(task.ID)) member.roles.add(task.ID);
    }

    static async resetStats(id?: Snowflake) {
        if (id) await Model.deleteOne({ id: id });
        else await Model.deleteMany({});
    }

    static createBar(current: number, required: number, total: number = 8): string {
        let percentage = (100 * current) / required;
        percentage = percentage > 100 ? 100 : percentage;

        let str = "";
        const progress = Math.round((percentage / 100) * total);
        str += percentage > 0 ? CONFIG.EMOJIS.FILL_START : CONFIG.EMOJIS.EMPTY_START;
        str += CONFIG.EMOJIS.FILL_CENTER.repeat(progress);
        str += CONFIG.EMOJIS.EMPTY_CENTER.repeat(8 - progress);
        str += percentage === 100 ? CONFIG.EMOJIS.FILL_END : CONFIG.EMOJIS.EMPTY_END;

        return str;
    }

    static numberToString(ms: number): string {
        if (ms === 0) return "Bulunamadı.";
        const hours = Math.floor(ms / 1000 / 60 / 60);
        const minutes = Math.floor((ms / 1000 / 60 / 60 - hours) * 60);
        const seconds = Math.floor(((ms / 1000 / 60 / 60 - hours) * 60 - minutes) * 60);
        return hours > 0 ? `${hours} saat, ${minutes}dakika` : `${minutes} dakika, ${seconds} saniye`;
    }
}
