import { Model } from "../helpers/Model";
import { CommandArgs, ICommand } from "my-module";
import { MessageEmbed } from "discord.js";
import { ExperienceService } from "../helpers/ExperienceService";

export default class Command implements ICommand {
    readonly usages = ["role", "role-stats", "rolestats"];

    async execute({ client, message, args }: CommandArgs) {
        if (!message.member?.hasPermission("ADMINISTRATOR")) return;

        const role = message.mentions.roles.first() || message.guild?.roles.cache.get(args[0]);
        if (!role) return message.channel.send("Geçerli bir rol belirtmelisin.");

        const datas = await Model.find({})
            .where("id")
            .in(role.members.map((member) => member.id))
            .exec();
        if (!datas.length) return message.channel.send("Belirttiğin role ait bir veri bulunmamaktadır.");

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
                        value: pointList || "Bulunamadı.",
                        inline: false,
                    },
                ])
                .setColor("RANDOM")
                .setTitle(message.guild?.name)
        );
    }
}
