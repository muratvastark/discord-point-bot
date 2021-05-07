import { Model } from "../helpers/Model";
import { CommandArgs, ICommand } from "my-module";
import { MessageEmbed } from "discord.js";
import { ExperienceService } from "../helpers/ExperienceService";

export default class Command implements ICommand {
    readonly usages = ["top"];

    async execute({ message }: CommandArgs) {
        const datas = await Model.find().exec();
        if (!datas.length) return message.channel.send("Veri bulunmamaktadır.");

        const voiceList = datas
            .filter((data) => data.voices.total)
            .sort((x, y) => y.voices.total - x.voices.total)
            .slice(0, 5)
            .map((data, i) => `\`${i + 1}.\` <@${data.id}> ${ExperienceService.numberToString(data.voices.total)}`)
            .join("\n");

        const messageList = datas
            .filter((data) => data.messages.total)
            .sort((x, y) => y.messages.total - x.messages.total)
            .slice(0, 5)
            .map((data, i) => `\`${i + 1}.\` <@${data.id}> ${data.messages.total}`)
            .join("\n");

        const pointList = datas
            .sort((x, y) => y.points - x.points)
            .slice(0, 5)
            .map((data, i) => `\`${i + 1}.\` <@${data.id}> ${data.points}`)
            .join("\n");

        message.channel.send(
            new MessageEmbed()
                .addFields([
                    {
                        name: "Mesaj Top 5",
                        value: messageList || "Bulunamadı.",
                        inline: false,
                    },
                    {
                        name: "Ses Top 5",
                        value: voiceList || "Bulanamadı.",
                        inline: false,
                    },
                    {
                        name: "Puan Top 5",
                        value: pointList || "Bulanamadı.",
                        inline: false,
                    },
                ])
                .setColor("RANDOM")
                .setTitle(message.guild?.name)
        );
    }
}
