import { MessageEmbed, User } from "discord.js";
import { CommandArgs, ICommand, IDocument } from "my-module";
import { Model } from "../helpers/Model";
import { CONFIG } from "../config";
import { ExperienceService } from "../helpers/ExperienceService";

export default class Command implements ICommand {
    readonly usages = ["message", "messages", "message-info", "messageinfo"];

    async execute({ client, message, args }: CommandArgs) {
        if (!client.checkStaff(message.author.id)) return;

        const user = (message.mentions.users?.first() || client.users?.cache.get(args[0]) || message.author) as User;
        if (!user) return message.channel.send("Geçerli bir kullanıcı belirtmelisin.");

        const data = await Model.findOne({ id: user.id });
        if (!data) return message.channel.send("Belirtilen kullanıcının verisi bulunmamaktadır.");

        const embed = new MessageEmbed().setAuthor(user.tag, user.displayAvatarURL({ dynamic: true })).setColor("RANDOM");

        const categories: IDocument[] = [];
        Object.keys(data.messages.categories || {}).forEach((key) => {
            categories.push({
                name: CONFIG.SYSTEM.CHANNELS.find((category) => category.ID === key)?.NAME as string,
                value: data.messages.categories[key],
            });
        });
        embed.addField(
            "Kategoriler",
            categories
                .sort((a, b) => a.value - b.value)
                .map((category) => `🔹 ${category.name}: \`${category.value}\``)
                .join("\n") || "Bulunamadı."
        );

        const channels: IDocument[] = [];
        Object.keys(data.messages.channels || {}).forEach((key) => {
            channels.push({
                name: `<#${key}>`,
                value: data.messages.channels[key],
            });
        });
        embed.addField(
            "Kanallar",
            channels
                .sort((a, b) => a.value - b.value)
                .map((channel) => `🔹 ${channel.name}: \`${channel.value}\``)
                .join("\n") || "Bulunamadı."
        );

        // POINT
        const currentTask = ExperienceService.getTask(data.points);
        const nextTask = ExperienceService.getTask(data.points, true);
        embed.addField(
            "Puan Bilgisi",
            `${ExperienceService.createBar(data.points, nextTask.POINT, 8)} ${data.points}/${nextTask.POINT}`
        );
        message.channel.send(embed);
    }
}
