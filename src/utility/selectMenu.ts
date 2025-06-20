
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";

// Select menu test
const selectMenu = new StringSelectMenuBuilder()
    .setCustomId("Starter")
    .setPlaceholder("Make a selection")
    .addOptions(
        new StringSelectMenuOptionBuilder()
            .setLabel("Britanniques")
            .setDescription("représentant l'Angleterre médiévale et les Anglo-normands.")
            .setValue("Britanniques")
            .setEmoji("1385299735895867513"),
        new StringSelectMenuOptionBuilder()
            .setLabel("Byzantins")
            .setDescription("based on the empire of the namesake around modern day Greece and Turkey.")
            .setValue("Byzantins")
            .setEmoji("1385266598796988569"),
        new StringSelectMenuOptionBuilder()
            .setLabel("Celtes")
            .setDescription("inspirée de l'Irlande et de l'Écosse médiévales")
            .setValue("Celtes")
            .setEmoji("1385314825348976650"),
    )


// Row only have between 1 to 5 component max
// Row can only have 1 Interactive component so you usally inherit the type from the intercative component you are planning to use
const actionRow = new ActionRowBuilder<StringSelectMenuBuilder>()
// Creation of a new component button, just add new object to the component array
    .addComponents(selectMenu)
