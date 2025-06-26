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

export function buttonStatePage(pageNumber: PageNumber, buttonToDisable: string = "") {

    let allCivRows = [...createAllRowsCiv(createAllButtonsCiv(buttonToDisable))];
    let numberOfRowsToBeShown = allCivRows.length;
    const itemsPerPage = 4;
    let pageNeeded = Math.ceil(numberOfRowsToBeShown / itemsPerPage);

    // Handling if the user is in the last page and only 1 civ is remaining in it.
    if (pageNumber > pageNeeded) {
        pageNumber = pageNeeded as PageNumber;
    }
    
    return [
        ...allCivRows.slice(itemsPerPage * (pageNumber - 1), itemsPerPage * pageNumber),
        // Page 3 won't be shown because at some point pageNeeded will become 2 and the next button won't appear anymore
        navButtonCreation(pageNeeded, pageNumber)
    ];


    function navButtonCreation(finalPage: number, pageNumber: PageNumber) {

        let arr = [];

        if (pageNumber > 1) {
            arr.push(previousButton)
        // All pages which are not the final page
        } 
        
        if (pageNumber < finalPage) {
            arr.push(nextButton)
        }

        return createNewRow(...arr);
    }
}
