import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { sortedCivlizations } from "./data.js";
import type { PageNumber } from "../index.js";
import { createNewRow } from "./utilities.js";
import { bannedOrPickedCivString } from "../bot.js";


const previousButton = new ButtonBuilder()
    .setCustomId("Previous")
    .setLabel("Previous")
    .setEmoji("⬅️")
    .setStyle(ButtonStyle.Primary)

const nextButton = new ButtonBuilder()
    .setCustomId("Next")
    .setLabel("Next")
    .setEmoji("➡️")
    .setStyle(ButtonStyle.Primary)


function createAllButtonsCiv(buttonToDisable: string = "") {

    let arr = []
    //sort by alphabetical order

    for (let i = 0; i < sortedCivlizations.length; i++) {
        // CHeck if a civ is among banned or picked civ 
        if (bannedOrPickedCivString.includes(sortedCivlizations[i])) {
            continue;
        }
        let newButtonComponent = new ButtonBuilder()
            .setCustomId(sortedCivlizations[i])
            .setLabel(sortedCivlizations[i])
            .setStyle(ButtonStyle.Secondary)
            arr.push(newButtonComponent)
        // Disable the selectioned civ button and store it's name for checking purpose
        if (buttonToDisable === sortedCivlizations[i]) {
            bannedOrPickedCivString.push(sortedCivlizations[i])
        }
    }

    return arr;
}

function createAllRowsCiv(buttons: ButtonBuilder[]) {
    let arr = []
    let newRow = new ActionRowBuilder<ButtonBuilder>()

    for (let i = 0; i < buttons.length; i++) {
        if (i % 5 === 0  && i !== 0) {
            arr.push(newRow)
            newRow = new ActionRowBuilder<ButtonBuilder>()
        }
        newRow.addComponents(buttons[i])
        
    }
    arr.push(newRow)
    return arr;
}

// FIXME: Find a solution, when deleting multiples buttons the last page will be empty.
export function buttonStatePage(pageNumber: PageNumber, buttonToDisable: string = "") {

    if (pageNumber === 1) {
        return [
            // It's a bit disgusting but I don't have much choice if I wanna change the state of a button to disabled
            // Create all buttons -> Create all row for the buttons -> Split and spread the first 4 Row => make a new row with the prev button
            ...createAllRowsCiv(createAllButtonsCiv(buttonToDisable)).slice(0,4), createNewRow(nextButton)
        ]
        
    } else if (pageNumber === 2) {
        return [...createAllRowsCiv(createAllButtonsCiv(buttonToDisable)).slice(5,9), createNewRow(previousButton)]
    } else {
        throw new Error("Unrecognized page number");
    }
}
