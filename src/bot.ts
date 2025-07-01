import dotenv from "dotenv";
import { Client, Events, GatewayIntentBits, InteractionCollector } from "discord.js";
import { embed } from "./utility/embeds.js";
import { buttonStatePage } from './utility/buttons.js';
import type { DraftSelection, PageNumber } from './index.js';
import { embedInitialState, embedReload, messageEdit, pageChange } from './utility/utilities.js';
import { civilizations } from './utility/data.js';
import http from "http";
import { connectToDB, getValuesFromDB, IntializeSlashCommand, updateScoresDB } from "./database/db.js";

dotenv.config();

// Server stuff
const port: number = Number(process.env.PORT) || 3000
const server = http.createServer(function(_req, res) {

    res.writeHead(200, { "content-type": "text/plain"});
    res.end("Pong!");
});

server.listen(port, function() {

})

console.log("Bot is starting...");

// Create a new client instance
export const client = new Client({ intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent
],
});

let isDraftActive: boolean = false;
// DRAFT COURSE
const draftState: string[] = [
    "🟠 Player 1 Ban",
    "🔵 Player 2 Ban",
    "🟠 Player 1 Ban",
    "🔵 Player 2 Ban",
    "🟠 Player 1 Ban",
    "🔵 Player 2 Ban",
    "🟠 Player 1 Pick",
    "🔵 Player 2 Pick",
    "🔵 Player 2 Pick",
    "🟠 Player 1 Pick",
    "🟠 Player 1 Pick",
    "🔵 Player 2 Pick",
    "🔵 Player 2 Pick",
    "🟠 Player 1 Pick",
    "🟠 Player 1 Pick",
    "🔵 Player 2 Pick",

]; 
// DRAFT STEP
let currentStep: number = 0;
// DRAFT DATA OBJECT
export let draftSelection: DraftSelection = {
    PlayerOnePicks: [],
    PlayerTwoPicks: [],
    Bans: [],
}
// BUTTONS PAGE LOGIC
let currentPageNumber: PageNumber = 1;
// Intializing the collector in global scope for the purpose of stopping the draft
let collector: InteractionCollector<any>;

export let bannedOrPickedCivString: string[] = [];


// When the client is ready, run this code (only once).
client.once(Events.ClientReady, async function (readyClient) {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
    // Initialize slash command for every server the bot has in the cache
    try {
        const promises = client.guilds.cache.map((g) =>  IntializeSlashCommand(g.id));
        await Promise.all(promises);

        console.log("Registered slash commands for all guilds in cache.");
        
    } catch (err) {
        console.log("Failed to register slash commands.",err);
        return null;
    }
});

client.on("messageCreate", async function (msg) {
    if (msg.content === "!draft") {
        if(isDraftActive) {
            msg.reply("A draft is already launched.\n Please either finish it or abandon it.")
        } else {
            isDraftActive = true;
            const interaction = await msg.reply({ 
                embeds: [embed],
                components: buttonStatePage(currentPageNumber),
            });

            // Huge timeout to not make the draft expire
            // The collector is like a data structure that stock all the informations related to the interaction with the interactive components
            collector = interaction.channel.createMessageComponentCollector({time: 999999999});
            
            collector.on("collect", async function (obj) {
                try {

                await obj.deferUpdate();
                if (obj.user.id !== msg.author.id) {
                    return null;
                }

                if (obj.customId === "Next" || obj.customId === "Previous") {
                    if (obj.customId === "Next") {
                        currentPageNumber = pageChange(currentPageNumber, "Next");
                    } else {
                        currentPageNumber = pageChange(currentPageNumber, "Previous");
                    }
                    return await messageEdit(obj.message, currentPageNumber, embed);
                }
                // Button = A civ
                if (civilizations.includes(obj.customId)) {
                    if (draftState[currentStep].includes("Ban")) {
                        // Ban
                        // Reload message just after a civ has been clicked to remove the choice
                        await messageEdit(obj.message, currentPageNumber, embed, obj.customId)
                        draftSelection.Bans.push(obj.customId);
                        currentStep++
                        // Reload embed and message for new state
                        embedReload(embed, draftSelection, draftState, currentStep)
                        await messageEdit(obj.message, currentPageNumber, embed, obj.customId)
                    } else if (draftState[currentStep].includes("Pick")) {
                        if (draftState[currentStep].includes("1")) {
                            // Player 1
                            await messageEdit(obj.message, currentPageNumber, embed, obj.customId)
                            draftSelection.PlayerOnePicks.push(obj.customId)
                            currentStep++
                            embedReload(embed, draftSelection, draftState, currentStep)
                            await messageEdit(obj.message, currentPageNumber, embed, obj.customId)
                        } else {
                            // Player 2
                            await messageEdit(obj.message, currentPageNumber, embed, obj.customId)
                            draftSelection.PlayerTwoPicks.push(obj.customId)
                            currentStep++
                            embedReload(embed, draftSelection, draftState, currentStep)
                            await messageEdit(obj.message, currentPageNumber, embed, obj.customId)
                        }
                        // Draft Stop
                        if (draftState[currentStep] === undefined) {
                            embedReload(embed, draftSelection, draftState, currentStep)
                            await messageEdit(obj.message, currentPageNumber, embed, obj.customId, false)
                            resetAllValues();
                            collector.stop()
                            return null;
                        }
                    }
                }
                } catch (error) {
                    console.log(error);
                    return null;
                }
            })
        }
    } else if (msg.content === "!gg") {
        await msg.reply("noob")
        return null;
    } else if (msg.content === "!draftstop") {
        // Stop the collector in order to not have some interactions problem.
        if (!isDraftActive) {
            msg.reply("There is no draft ongoing.\n You can type !draft to launch one.")
            return null;
        } 
        collector.stop();
        msg.reply("The draft has been stopped\n You can type !draft to launch a new one.")
        resetAllValues();
    }
    return null;
})

// Score slash command handling
client.on("interactionCreate", async function (interaction) {
    if (!interaction.isChatInputCommand()) {
        console.log(interaction);
        return null;
    } else {
        try {
            if (interaction.commandName = "draft") {
                await interaction.deferReply();
                const subCommand = interaction.options;
                const subCommandName = interaction.options.getSubcommand();
                if (subCommandName === "add_score") {
                    const winnerNameOverall = subCommand.getUser("winner")?.username;
                    const loserNameOverall = subCommand.getUser("loser")?.username;
                    // FIXME: All these block could be fetched into a single one with a function or smth
                    if (!winnerNameOverall || !loserNameOverall) {
                        await interaction.editReply("The user is unrecognzied, please enter a valid user");
                        return null;
                    } else if (winnerNameOverall === loserNameOverall) {
                        await interaction.editReply("Both names are the same, please enter valid users.")
                    } else {
                    const winnerScoreOverall = subCommand.getNumber("score_winner");
                    const loserScoreOverall = subCommand.getNumber("score_loser");
                    await connectToDB(function () {return updateScoresDB("Overall", winnerNameOverall, loserNameOverall, winnerScoreOverall, loserScoreOverall)});
                    await interaction.editReply(`${winnerNameOverall} + ${winnerScoreOverall} score overall\n${loserNameOverall} + ${loserScoreOverall} score overall`);
                    return null;
                    }
                } else if (subCommandName === "add_bo") {
                    const winnerNameBO = subCommand.getUser("winner")?.username;
                    const loserNameBO = subCommand.getUser("loser")?.username;
                    if (!winnerNameBO || !loserNameBO) {
                        await interaction.editReply("Users are unrecognzied, please enter valid users.");
                        return null;
                    } else if (winnerNameBO === loserNameBO) {
                        await interaction.editReply("Both names are the same, please enter valid users.")
                    } else {
                    const winnerScoreBO = subCommand.getNumber("score_winner");
                    const loserScoreBO = subCommand.getNumber("score_loser");
                    await connectToDB(function () {return updateScoresDB("BO", winnerNameBO, loserNameBO, winnerScoreBO, loserScoreBO)});
                    await interaction.editReply(`${winnerNameBO} + ${winnerScoreBO} score BO\n${loserNameBO} + ${loserScoreBO} score BO`);
                    return null;
                    }
                } else if (subCommandName === "get_score")  {
                    const playerOneName = subCommand.getUser("player_1")?.username;
                    const playerTwoName = subCommand.getUser("player_2")?.username;
                    if (!playerOneName || !playerTwoName) {
                        await interaction.editReply("Users are unrecognzied, please enter valid users.");
                        return null;
                    } else {
                    try {
                        const stringScores = await connectToDB(function() {return getValuesFromDB(playerOneName, playerTwoName)});
                        if (!stringScores) {
                            throw new Error("Problem when building the string.")
                        }
                        await interaction.editReply(stringScores);
                    } catch (error) {
                        console.log(error)
                        await interaction.editReply("Couldn't find the users in the database")
                    }
                }
                } else {
                    await interaction.editReply("This command is unrecognized.");
                    return null;
                }
            }
        } catch  (error) {
            console.log(error)
            await interaction.editReply("Something went wrong, please re-do the command.");
            return null;            
        }
    }
})

// State reset of the draft
function resetAllValues(): void {
    
    currentStep = 0;
    draftSelection.PlayerOnePicks =  [];
    draftSelection.PlayerTwoPicks = [];
    draftSelection.Bans = [];
    currentPageNumber = 1;
    isDraftActive = false;
    embed.spliceFields(0, embed.length - 1)
    embedInitialState(embed);
    bannedOrPickedCivString = [];
    
    return;
}


// Log in to Discord with your client's token
client.login(process.env.DISCORD_TOKEN);