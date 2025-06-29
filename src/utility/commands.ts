import { SlashCommandBuilder } from "discord.js";

export const slashCommand = new SlashCommandBuilder()
    .setName("draft")
    .setDescription("Command to add scores to players.")

        // Add Overall
        .addSubcommand((subcommand) => 
            subcommand
        .setName("add_score")
        .setDescription("Add to the overall score of 2 players.")

            // String name winner + looser
            .addUserOption((opti) =>
                opti
            .setName("winner")
            .setDescription("Select the winner")
            .setRequired(true)
            )
            .addUserOption((opti) =>
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
        .setDescription("Add to the overall BO score of 2 players.")

            // String name winner + looser
            .addUserOption((opti) =>
                opti
            .setName("winner")
            .setDescription("Select the winner")
            .setRequired(true)
            )
            .addUserOption((opti) =>
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
        

        .addSubcommand((subcommand) =>
            subcommand
        .setName("get_score")
        .setDescription("Show the current score of 2 players.")

            .addUserOption((opti) =>
                opti
            .setName("player_1")
            .setDescription("Select a Player")
            .setRequired(true))

            .addUserOption((opti) =>
                opti
            .setName("player_2")
            .setDescription("Select a Player")
            .setRequired(true))
    )