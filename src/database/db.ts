import dotenv from "dotenv";
import { MongoClient, ServerApiVersion } from "mongodb";
import { constructStringDBValues } from "../utility/utilities.js";
import { REST, Routes } from "discord.js";
import { slashCommand } from "../utility/commands.js";
import { client } from "../bot.js";

dotenv.config();

// Database stuff
const uriMongoDB = `mongodb+srv://${process.env.DBURI!}`


export const clientDB = new MongoClient(uriMongoDB, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
})

// Name db and collection
// It is not necessary to check their existence mongoDB does it automatically
const dbName = "AOE2_Draft_DB";
// FIXME: Test collection, to fix when deploying
const collectionName = "test_scores";

const database = clientDB.db(dbName);
const collection = database.collection(collectionName);

export async function getValuesFromDB(nameWinner: string, nameLoser: string): Promise<string> {
    const idKey = alphabeticalIdKeyCreation(nameWinner, nameLoser);
    try {
    const object = await collection.findOne({ name: idKey})

    if (!object) {
        throw new Error("Couldn't find scores in the DB")
    }

    return constructStringDBValues(object, nameLoser, nameWinner);

    } catch (error) {
        throw error
    }
}

export async function updateScoresDB(type: "BO" | "Overall", nameWinner: string, nameLoser: string, scoreWinner: number | null, scoreLoser: number | null): Promise<null> {

    const idKey = alphabeticalIdKeyCreation(nameWinner, nameLoser);
    
    const query = { name: idKey };
    let update = {};
    const options = { upsert: true };
    if (type === "BO") {
        // Increment value by the score dot notation enforced by mongoDB and computed property name necessary
        update = { $inc: {
            [`BOScores.${nameWinner}`]: scoreWinner,
            [`BOScores.${nameLoser}`]: scoreLoser
        }};
    } else {
        update = { $inc: {
            [`overallScores.${nameWinner}`]: scoreWinner,
            [`overallScores.${nameLoser}`]: scoreLoser
        }};    
    }

    await collection.updateOne(query, update, options);
    return null;
}

export async function connectToDB(manipulationDB: Function) {
    try {

        await clientDB.connect();
        await clientDB.db("admin").command({ ping: 1})
        console.log("Connected to DB");
        // Function which do thing in the DB
        if (manipulationDB) {
            // Attribute to a variable if we fetch value from the db
            const values: null | string = await manipulationDB()
            if (values) {
                return values;
            }
        }
    } catch (error) {
        throw error;
    } finally {
        await clientDB.close();
        console.log("DB link has been closed")
    }
}

export async function IntializeSlashCommand(guildId: string | undefined) {

    const clientId = "1384919923054350456";

    try {
        // Slash command list
        const commands = [slashCommand];

        // API stuff for registering the slash commands
        const rest = new REST({version: "9"}).setToken(process.env.DISCORD_TOKEN!);
        if (!guildId) {
            throw new Error("Couldn't get the guildId")
        }
        
        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands },
        )

    } catch (err) {
        throw err;
    }

}

function alphabeticalIdKeyCreation(nameOne: string, nameTwo: string): string {
    // Alphabetical order in order to get a key deterministically
    const arr = [nameOne, nameTwo].sort((a, b) => a.localeCompare(b));
    return `${arr[0]}_${arr[1]}`
}

