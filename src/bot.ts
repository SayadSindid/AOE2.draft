import 'dotenv/config'
import { Client, Events, GatewayIntentBits } from "discord.js";
import { embed } from "./utility/embeds.js";
import { buttonStatePage } from './utility/buttons.js';
import type { DraftSelection, PageNumber } from './index.js';
import { embedReload, messageEdit, pageChange } from './utility/utilities.js';
import { civilizations } from './utility/data.js';


console.log("Bot is starting...");

// Create a new client instance
const client = new Client({ intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent
],
});


// TODO: Implement proper program ending and force reset

// DRAFT LOGIC
let isDraftActive: boolean = false;
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
// Step draft state incrementer or decrementer if the user wanna go back a state in the draft
let currentStep: number = 0;
let draftSelection: DraftSelection = {
    PlayerOnePicks: [],
    PlayerTwoPicks: [],
    Bans: [],
}
// BUTTONS PAGE LOGIC
let currentPageNumber: PageNumber = 1;

// When the client is ready, run this code (only once).
client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on("messageCreate", async function(msg) {
    if (msg.content === "!draft") {
        if(isDraftActive) {
            msg.reply("A draft is already launched.\n Please either finish it or abandon it.")
        } else {
            // TODO: Error handling when click on previous or next and it lead to OOB
            const interaction = await msg.reply({ 
                embeds: [embed],
                components: buttonStatePage(currentPageNumber),
            });

            // Timeout of around 10 minutes
            const collector = interaction.channel.createMessageComponentCollector({time: 999999999});

            collector.on("collect", async function(obj) {

                console.log(`Interaction : ${obj.customId} and ${obj.user.id}`);
                if (obj.user.id !== msg.author.id) {
                    return await obj.reply({content: "This draft isn't made by you", ephemeral: true})
                }

                if (obj.customId === "Next" || obj.customId === "Previous") {
                    if (obj.customId === "Next") {
                        currentPageNumber = pageChange(currentPageNumber, "Next");
                        
                    } else {
                        currentPageNumber = pageChange(currentPageNumber, "Previous");
                    }
                    await messageEdit(obj.message, currentPageNumber, embed)
                    obj.deferUpdate()
                }
                
                if (civilizations.includes(obj.customId)) {
                    // TODO: Do a reload just after the user clicked in order not to be able to reclick a civ that have been banned or picked
                    if (draftState[currentStep].includes("Ban")) {
                        currentStep++
                        draftSelection.Bans.push(obj.customId);
                        embedReload(embed, draftSelection, draftState, currentStep)
                        await messageEdit(obj.message, currentPageNumber, embed, obj.customId)
                        obj.deferUpdate()
                    } else if (draftState[currentStep].includes("Pick")) {
                        if (draftState[currentStep].includes("1")) {
                            currentStep++
                            draftSelection.PlayerOnePicks.push(obj.customId)
                            embedReload(embed, draftSelection, draftState, currentStep)
                            await messageEdit(obj.message, currentPageNumber, embed, obj.customId)
                            obj.deferUpdate()
                        } else {
                            currentStep++
                            draftSelection.PlayerTwoPicks.push(obj.customId)
                            embedReload(embed, draftSelection, draftState, currentStep)
                            await messageEdit(obj.message, currentPageNumber, embed, obj.customId)
                            obj.deferUpdate()
                        }
                        // TODO: Stop the draft
                        // if (draftState[currentStep] === undefined) {
                            
                        // }
                    }
                }

            })
            


        }
    } else if (msg.content === "!gg") {
        msg.reply("noob")
    }
})


// Log in to Discord with your client's token
client.login(process.env.DISCORD_TOKEN);



