import { MessageEmbed, User } from "discord.js";
import { CommandArgs, ICommand, IDocument } from "my-module";
import { Model } from "../helpers/Model";
import { CONFIG } from "../config";
import { ExperienceService } from "../helpers/ExperienceService";

export default class Command implements ICommand {
    readonly usages = ["stats", "me", "info"];

    async execute({ client, message, args }: CommandArgs) {
        if (client.checkStaff(message.author.id) === false) return;

        const user = (message.mentions.users?.first() || client.users?.cache.get(args[0]) || message.author) as User;
        if (!user) return message.channel.send("Geçerli bir kullanıcı belirtmelisin.");

        const data = await Model.findOne({ id: user.id }).exec();
        if (!data) return message.channel.send("Belirtilen kullanıcının verisi bulunmamaktadır.");

        const embed = new MessageEmbed().setAuthor(user.tag, user.displayAvatarURL({ dynamic: true })).setColor("RANDOM");
        embed.addField("Genel Bilgiler", [
            `🎙️ Toplam Sesli: \`${ExperienceService.numberToString(data.voices.total || 0)}\``,
            `📫 Toplam Mesaj: \`${data.messages.total ? `${data.messages.total} mesaj` : "Bulunamadı."}\``,
            `✉️ Davet Bilgisi: \`${data.invites ? `${data.invites} davet` : "Bulunamadı."}\``,
        ]);

        // VOICE
        const voiceCategories: IDocument[] = [];
        Object.keys(data.voices.categories || {}).forEach((key) => {
            voiceCategories.push({
                name: CONFIG.SYSTEM.CHANNELS.find((category) => category.ID === key)?.NAME as string,
                value: data.voices.categories[key],
            });
        });
        embed.addField(
            "Ses Bilgileri",
            voiceCategories
                .sort((a, b) => a.value - b.value)
                .map((category) => `🔹 ${category.name}: \`${ExperienceService.numberToString(category.value)}\``)
                .join("\n") || "Bulunamadı."
        );

        // MESSAGE
        const messageCategories: IDocument[] = [];
        Object.keys(data.messages.categories || {}).forEach((key) => {
            messageCategories.push({
                name: CONFIG.SYSTEM.CHANNELS.find((category) => category.ID === key)?.NAME as string,
                value: data.messages.categories[key],
            });
        });
        embed.addField(
            "Mesaj Bilgileri",
            messageCategories
                .sort((a, b) => a.value - b.value)
                .map((category) => `🔹 ${category.name}: \`${category.value}\``)
                .join("\n") || "Bulunamadı."
        );

        // POINT
        const currentTask = ExperienceService.getTask(data.points);
        const nextTask = ExperienceService.getTask(data.points, true);
        embed.addField(
            "Puan Bilgisi",
            nextTask
                ? `${ExperienceService.createBar(data.points, nextTask.POINT, 8)} ${data.points}/${nextTask.POINT}`
                : "Bütün görevler yapıldı!"
        );
        if (nextTask) {
            embed.addField(
                "Yetkili Durumu",
                `${currentTask ? `Sen şuanda <@&${currentTask.ID}> rolündesin.` : "Hiç bir görev yapmamışsın."} <@&${
                    nextTask.ID
                }> sonraki görevin rolü almak için **${nextTask.POINT - data.points}** puana ihtiyacın var.`
            );
        }
        message.channel.send(embed);
    }
}
