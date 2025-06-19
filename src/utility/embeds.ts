import { EmbedBuilder } from "discord.js";

// Draft embed
export const embed = new EmbedBuilder()
  .setAuthor({
    name: "⚔️ DRAFT ⚔️",
  })
  .setTitle("🟧 Player 1")
  .setDescription("🟠 @Player 1 ban a civilization!\n⌛{Time_Remaining} remaining !\n​") // Special character to jump line
  .addFields(
    {
      name: "🚫BANS",
      value: "{List_of_Ban_Done_Until_Now}\n​", // Special character to jump line
      inline: false
    },
    {
      name: "🟧 Player 1 Pick",
      value: "{List_Of_Pick_Until_Now}\n​", // Special character to jump line
      inline: false
    },
    {
      name: "🟦 Player 2 Pick",
      value: "{List_Of_Pick_Until_Now}\n​", // Special character to jump line
      inline: false
    },
    {
      name: "DRAFT",
      value: `\`\`\`

BANS
[🔶]🔷🔶🔷🔶🔷                           
---------------------------------------
PICKS
                🔶🔷🔷🔶🔶🔷🔷🔶🔶🔷
\`\`\``,
      inline: false
    },
  )
  .setColor("#00b0f4")
  .setFooter({
    text: "AOE2 Drafter",
    iconURL: "https://www.aoe2cm.net/images/civs/japanese.png",
    // TODO: {Helmet_Icon_URL}
  })
  .setTimestamp();
