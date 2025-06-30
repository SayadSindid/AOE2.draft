import { ActionRowBuilder, ButtonBuilder, EmbedBuilder, Message } from "discord.js";
import type { ArrowDir, DraftSelection, PageNumber, UnnaturalPattern } from "../index.js";
import { buttonStatePage } from "./buttons.js";
import type { Document, WithId } from "mongodb";

// Helper function create new Actionrow
export function createNewRow(...args: ButtonBuilder[]) {
    return new ActionRowBuilder<ButtonBuilder>().addComponents(...args);
}


export function pageChange(page:PageNumber, dir: ArrowDir): PageNumber {

    // I wonder if the error is needed since I never show the button that could lead to it.
    const error = new Error("OOB page request");

    if (dir === "Next") {
        if (page === 1) {
            return 2;
        } else if (page === 2) {
            return 3;
        } else {
            throw error;
        }
    } else if (dir === "Previous") {
        if (page === 2) {
            return 1;
        } else if (page === 3) {
            return 2;
        } else {
            throw error;
        }
    }
    throw error;
}

// Edit message 
export async function messageEdit(message: Message, currentPageNumber: PageNumber, embed: EmbedBuilder, buttonCivToDisable: string = "", noButtons: boolean = true) {

    if (noButtons) {
        return await message.edit({
            embeds: [embed],
            components: buttonStatePage(currentPageNumber, buttonCivToDisable),
            })
    } else {
        return await message.edit({
            embeds: [embed],
            components: []
        })
    }


}

// Draft state check
export function fieldUpdate(Bans: string[], PlayerOnePicks: string[], PlayerTwoPicks: string[], StepDraft: number) {

    
    const bansString = Bans.join(" - ");
    const PlayerOneString = PlayerOnePicks.join(" - ")
    const PlayerTwoString = PlayerTwoPicks.join(" - ");


// TODO: DRAFT CODE BLOCK TO FINISH
    function draftCodeBlockUpdate(StepDraft:number): string {


        // A diamond count as 2 string char

        const baseBlockDraftBansString = "🔶🔷🔶🔷🔶🔷                           ";
        const baseBlockDraftPicksString = "                🔶🔷🔷🔶🔶🔷🔷🔶🔶🔷";
        let updatedBlockDraftBansString = "";
        let updatedBlockDraftPicksString = "";

        // FIXME: HARDCODED need to fix it it's unproper
        const unnaturalPattern: UnnaturalPattern = {
            7: baseBlockDraftPicksString.slice(0, 19) + "[🔷]" + baseBlockDraftPicksString.slice(19),
            8: baseBlockDraftPicksString.slice(0, 21) + "[🔷]" + baseBlockDraftPicksString.slice(21),
            9: baseBlockDraftPicksString.slice(0, 23) + "[🔶]" + baseBlockDraftPicksString.slice(23),
            10: baseBlockDraftPicksString.slice(0, 25) + "[🔶]" + baseBlockDraftPicksString.slice(25),
            11: baseBlockDraftPicksString.slice(0, 27) + "[🔷]" + baseBlockDraftPicksString.slice(27),
            12: baseBlockDraftPicksString.slice(0, 29) + "[🔷]" + baseBlockDraftPicksString.slice(29),
            13: baseBlockDraftPicksString.slice(0, 31) + "[🔶]" + baseBlockDraftPicksString.slice(31),
            14: baseBlockDraftPicksString.slice(0, 33) + "[🔶]" + baseBlockDraftPicksString.slice(33),
        }


        // Ban phase
        if (StepDraft < 6) {
            // Always have base pick string during ban phase
            updatedBlockDraftPicksString = baseBlockDraftPicksString;
            if (StepDraft % 2 === 0) {
                updatedBlockDraftBansString = baseBlockDraftBansString.slice(0, StepDraft * 2) + "[🔶]" + baseBlockDraftBansString.slice(StepDraft * 2 + 2)
            } else {
                updatedBlockDraftBansString = baseBlockDraftBansString.slice(0, StepDraft * 2) + "[🔷]" + baseBlockDraftBansString.slice(StepDraft * 2 + 2)
            }
        // Pick phase
        } else {
            // Always have base ban string during pick phase
            updatedBlockDraftBansString = baseBlockDraftBansString;
            // Build string manually for the first and last since their pattern is unnatural
            if (StepDraft === 6) {
                updatedBlockDraftPicksString = "                " + "[🔶]" + baseBlockDraftPicksString.slice(18);
            } else if (StepDraft === 15) {
                updatedBlockDraftPicksString = baseBlockDraftPicksString.slice(0, -2) + "[🔷]";
            } else {
                updatedBlockDraftPicksString = unnaturalPattern[StepDraft]
            }
        }

    
        return `\`\`\`

BANS
${updatedBlockDraftBansString}
---------------------------------------
PICKS
${updatedBlockDraftPicksString}
\`\`\``

    }





    
    return [{
            name: "🚫BANS",
            value: bansString + "\n​", // Special character to jump line
            inline: false
          },
          {
            name: "🟧 Player 1 Pick",
            value: PlayerOneString + "\n​", // Special character to jump line
            inline: false
          },
          {
            name: "🟦 Player 2 Pick",
            value: PlayerTwoString + "\n​", // Special character to jump line
            inline: false
          },
          {
            name: "DRAFT",
            value: draftCodeBlockUpdate(StepDraft),
            inline: false
        }
        ]
}

// Embed reload
export function embedReload(embed: EmbedBuilder, draftObject: DraftSelection, stateDraft: string[], StepDraft: number): void {

    // Embed change when the draft has ended
    if (StepDraft === 16) {        
        embed.setFields(fieldUpdate(draftObject.Bans, draftObject.PlayerOnePicks, draftObject.PlayerTwoPicks, StepDraft))
        embed.setDescription(`Draft is finished!`)
        embed.spliceFields(-1, 1);
    
        embed.setTitle("Draft selection")

        return;
    }

    embed.setFields(fieldUpdate(draftObject.Bans, draftObject.PlayerOnePicks, draftObject.PlayerTwoPicks, StepDraft))
    embed.setDescription(`${stateDraft[StepDraft]} a civilization!`)

    if (stateDraft[StepDraft].includes("1")) {
        embed.setTitle("🟧 Player 1")
    } else {
        embed.setTitle("🟦 Player 2")
    }

    return;
}

export function embedInitialState(embed:EmbedBuilder): void {
    embed
        .setAuthor({
        name: "⚔️ DRAFT ⚔️",
        })
        .setTitle("🟧 Player 1")
      .setDescription("🟠 Player 1 ban a civilization!\n") // Special character to jump line
        .addFields(
        {
        name: "🚫BANS",
          value: "\n​\n​", // Special character to jump line
        inline: false
        },
        {
        name: "🟧 Player 1 Pick",
          value: "\n​\n​", // Special character to jump line
        inline: false
        },
        {
        name: "🟦 Player 2 Pick",
          value: "\n​\n​", // Special character to jump line
        inline: false
        },
        {
        name: "DRAFT",
        value: `\`\`\`
BANS
[🔶]🔷🔶🔷🔶🔷                           
---------------------------------------
PICKS
                🔶🔷🔷🔶🔶🔷🔷🔶🔶🔷\`\`\``,
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
    
}

export function constructStringDBValues(playersScoreObject: WithId<Document>, playerOne: string, PlayerTwo: string): string {
    try {
        const scoreBOPlayerOne = playersScoreObject.BOScores[playerOne];
        const scoreBOPlayerTwo = playersScoreObject.BOScores[PlayerTwo];
        const scoreOverallPlayerOne = playersScoreObject.overallScores[playerOne];
        const scoreOverallPlayerTwo = playersScoreObject.overallScores[PlayerTwo];
        if (!scoreBOPlayerOne || !scoreBOPlayerTwo || !scoreOverallPlayerOne || !scoreOverallPlayerTwo) {
            throw new Error("Problem parsing database");
        }

        return `**SCORES**\n\n**OVERALL**\n${playerOne}: ${scoreOverallPlayerOne}\n${PlayerTwo}: ${scoreOverallPlayerTwo}\n\n**BO WIN**\n${playerOne}: ${scoreBOPlayerOne}\n${PlayerTwo}: ${scoreBOPlayerTwo}`;
    } catch (error) {
        console.log(error)
        throw error;
    }
}