import { CommandArgs, ICommand } from "my-module";
import { MessageEmbed } from "discord.js";
import { CONFIG } from "../config";

export default class Command implements ICommand {
    readonly usages = ["eval", "hewal", "avel"];

    async execute({ client, message, args }: CommandArgs) {
        if (!CONFIG.BOT.DEVELOPERS.includes(message.author.id)) return;

        try {
            const code = args.join(" ");
            let evaled = eval(code);

            if (typeof evaled !== "string") evaled = require("util").inspect(evaled);

            message.channel.send(this.clean(evaled), { code: "xl" });
        } catch (err) {
            message.channel.send(`\`ERROR\` \`\`\`xl\n${this.clean(err)}\n\`\`\``);
        }
    }

    clean(text: any) {
        if (typeof text === "string")
            return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
        else return text;
    }
}
