import dotenv from "dotenv";
import { Client, Events, GatewayIntentBits, InteractionCollector } from "discord.js";
import { embed } from "./utility/embeds.js";
import { buttonStatePage } from './utility/buttons.js';
import type { DraftSelection, PageNumber } from './index.js';
import { embedInitialState, embedReload, messageEdit, pageChange } from './utility/utilities.js';
import { civilizations } from './utility/data.js';
import http from "http";

// Server stuff
const port: number = Number(process.env.PORT) || 3000
const server = http.createServer(function(_req, res) {

    res.writeHead(200, { "content-type": "text/plain"});
    res.end("Pong!");
});

server.listen(port, function() {

})


dotenv.config();

console.log("Bot is starting...");

// Create a new client instance
const client = new Client({ intents: [
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
client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on("messageCreate", async function(msg) {
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
            
            collector.on("collect", async function(obj) {
                try {

                await obj.deferUpdate();
                if (obj.user.id !== msg.author.id) {
                    await msg.reply({content: "This draft isn't made by you"})
                }

                if (obj.customId === "Next" || obj.customId === "Previous") {
                    if (obj.customId === "Next") {
                        currentPageNumber = pageChange(currentPageNumber, "Next");
                        
                    } else {
                        currentPageNumber = pageChange(currentPageNumber, "Previous");
                    }
                    return await messageEdit(obj.message, currentPageNumber, embed)
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
                            return;
                        }
                    }
                }
                } catch (error) {
                    console.log(error);
                    return;
                }
            })
        }
    } else if (msg.content === "!gg") {
        msg.reply("noob")
    } else if (msg.content === "!draftstop") {
        // Stop the collector in order to not have some interactions problem.
        // FIXME: Strange bug, if a user start a draft and after make draft stop it will go show the there is no draft ongoing message.
        if (!isDraftActive) {
            msg.reply("There is no draft ongoing.\n You can type !draft to launch one.")
            return;
        } 
        collector.stop();
        msg.reply("The draft has been stopped\n You can type !draft to launch a new one.")
        resetAllValues();
    }
    return;
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



