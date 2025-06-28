import { SlashCommandBuilder } from "discord.js";

export const slashCommand = new SlashCommandBuilder()
    .setName("draft")
    .setDescription("Command to add scores to players.")

        // Add Overall
        .addSubcommand((subcommand) => 
            subcommand
        .setName("add_score")
        .setDescription("Add to the overall score of 2 player.")

            // String name winner + looser
            .addStringOption((opti) =>
                opti
            .setName("winner")
            .setDescription("Select the winner")
            .setRequired(true)
            )
            .addStringOption((opti) =>
                opti
            .setName("loser")
            .setDescription("Select the loser")
            .setRequired(true)
            )

            // Number score winner + loser
            .addNumberOption((opti) =>
                opti
            .setName("score_winner")
            .setDescription("Enter the score of the winner")
            .setRequired(true)
            )
            .addNumberOption((opti) =>
                opti
            .setName("score_loser")
            .setDescription("Enter the score of the loser")
            .setRequired(true)
            )
        )
        



        // Add BO Score
        .addSubcommand((subcommand) =>
            subcommand
        .setName("add_bo")
        .setDescription("Add to the overall BO score of 2 player")

            // String name winner + looser
            .addStringOption((opti) =>
                opti
            .setName("winner")
            .setDescription("Select the winner")
            .setRequired(true)
            )
            .addStringOption((opti) =>
                opti
            .setName("loser")
            .setDescription("Select the loser")
            .setRequired(true)
            )

            // Number score winner + loser
            .addNumberOption((opti) =>
                opti
            .setName("score_winner")
            .setDescription("Enter the score of the winner")
            .setRequired(true)
            )
            .addNumberOption((opti) =>
                opti
            .setName("score_loser")
            .setDescription("Enter the score of the loser")
            .setRequired(true)
            )
        )