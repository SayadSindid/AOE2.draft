import { ActionRowBuilder, ButtonBuilder, Embed, EmbedBuilder, Message } from "discord.js";
import type { ArrowDir, DraftSelection, PageNumber } from "../index.js";
import { buttonStatePage } from "./buttons.js";

// Helper function create new Actionrow
export function createNewRow(...args: ButtonBuilder[]) {
    return new ActionRowBuilder<ButtonBuilder>().addComponents(...args);
}


export function pageChange(page:PageNumber, dir: ArrowDir): PageNumber {

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
        if (page === 3) {
            return 2;
        } else if (page === 2) {
            return 1;
        } else {
            throw error;        }
    }
    throw error;
}

// Edit message 
export function messageEdit(message: Message, currentPageNumber: PageNumber, embed: EmbedBuilder, buttonCivToDisable: string = "") {
    return message.edit({
            embeds: [embed],
            components: buttonStatePage(currentPageNumber, buttonCivToDisable),
            })
}

// Draft state check
export function fieldUpdate(Bans: string[], PlayerOnePicks: string[], PlayerTwoPicks: string[], StepDraft: number) {

    
    const bansString = Bans.join(" ");
    const PlayerOneString = PlayerOnePicks.join(" ")
    const PlayerTwoString = PlayerTwoPicks.join(" ");


// TODO: DRAFT CODE BLOCK TO FINISH
    function draftCodeBlockUpdate(StepDraft:number): string {

        let blockDraftBansString = "🔶🔷🔶🔷🔶🔷                           "
        let blockDraftPicksString = "                🔶🔷🔷🔶🔶🔷🔷🔶🔶🔷"

        if (StepDraft % 2 === 0) {
            blockDraftBansString.slice(StepDraft + 2)
            "[🔶]"
        } else {
            "[🔷]"
        }


    
        return `\`\`\`

BANS
${blockDraftBansString}
---------------------------------------
PICKS
${blockDraftPicksString}
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
            // TODO: Draft visual Update ???
            value: draftCodeBlockUpdate(StepDraft),
            inline: false
        }
        ]
}

// Embed reload
export function embedReload(embed: EmbedBuilder, draftObject: DraftSelection, stateDraft: string[], StepDraft: number): EmbedBuilder {
    embed.setFields(fieldUpdate(draftObject.Bans, draftObject.PlayerOnePicks, draftObject.PlayerTwoPicks, StepDraft))
    embed.setDescription(`${stateDraft[StepDraft]} a civilization!`)

    return embed;
}