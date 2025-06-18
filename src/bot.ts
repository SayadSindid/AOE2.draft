import 'dotenv/config'
import { Client, Events, GatewayIntentBits } from "discord.js";
import { exampleEmbed } from "./utility/embeds.js";


console.log("Bot is starting...");

// Create a new client instance
const client = new Client({ intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent
],
});

// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.
client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on("messageCreate", async function(msg) {
    if (msg.content === "!draft") {
        await msg.reply({ embeds: [exampleEmbed] });
    } else if (msg.content === "gg") {
        msg.reply("noob")
    }
})


// Log in to Discord with your client's token
client.login(process.env.DISCORD_TOKEN);



