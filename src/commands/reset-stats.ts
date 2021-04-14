import { CommandArgs, ICommand, IDocument } from "my-module";
import { ExperienceService } from "../helpers/ExperienceService";

export default class Command implements ICommand {
    readonly usages = ["reset-stats"];

    async execute({ client, message, args }: CommandArgs) {
        if (!message.member?.hasPermission("ADMINISTRATOR")) return;

        if (args[0] && args[0].toLowerCase() === "tüm") {
            ExperienceService.resetStats();
            message.channel.send("Başarıyla bütün veriler silindi.");
            return;
        }

        const user = message.mentions.users.first() || client.users.cache.get(args[0]);
        if (user) {
            ExperienceService.resetStats(user.id);
            message.channel.send("Başarıyla belirtilen kullanıcnın verileri silindi.");
            return;
        }

        message.channel.send("Geçerli bir argüman belirtiniz.");
    }
}
