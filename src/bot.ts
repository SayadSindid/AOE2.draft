import 'dotenv/config'
import { Client, Events, GatewayIntentBits } from "discord.js";
import { embed } from "./utility/embeds.js";
import { actionRow } from './utility/buttons.js';


console.log("Bot is starting...");

// Create a new client instance
const client = new Client({ intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent
],
});

// TODO: Make buttons for each civ from the Civ available, Iterator with with button creation and icon fetching + from the Civ avaialbe string.

let isDraftActive: boolean = false;
// TODO: Initialize each step of the draft
const draftState: string[] = []; 
// Step draft state incrementer
// or decrementer if the user wanna go back a state in the draft
let currentStep: number = 0;
let PlayerOnePicks: string[] = [];
let PlayerTwoPicks: string[] = [];
let Bans: string[] = [];

// When the client is ready, run this code (only once).
// TODO: Make like 10 Civ max per embed and make a button to go to a 2nd page
client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on("messageCreate", async function(msg) {
    if (msg.content === "!draft") {
        if(isDraftActive) {
            msg.reply("A draft is already launched.\n Please either finish it or abandon it.")
        } else {
            await msg.reply({ 
                embeds: [embed],
                components: [actionRow] 
            });
        }
    } else if (msg.content === "!gg") {
        msg.reply("noob")
    }
})


// Log in to Discord with your client's token
client.login(process.env.DISCORD_TOKEN);



