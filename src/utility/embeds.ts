import { EmbedBuilder } from "discord.js";

export const exampleEmbed = new EmbedBuilder()
    .setColor(0x0099FF)
    .setTitle("Start a new draft")
    .setAuthor({
        name: "AOE2 DRAFTER",
        // iconURL:"",
        // url:"",
    })
    .setDescription("How to make a new draft: Explanation")
    .setTimestamp()
    .setFooter({
        text:"ggnoob",
        // iconURL:"",
    })


