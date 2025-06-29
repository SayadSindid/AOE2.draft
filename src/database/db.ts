import { MongoClient, ServerApiVersion } from "mongodb";
import { constructStringDBValues } from "../utility/utilities.js";

// Database stuff
export const uriMongoDB = `mongodb+srv://${process.env.DBURI!}`


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
const collectionName = "scores";

const database = clientDB.db(dbName);
const collection = database.collection(collectionName);



export function getValuesFromDB(nameWinner: string, nameLoser: string): object {
    // TODO: I need to get both the overall scores and the BO scores to show to the user.
    // TODO: Make the alphabetical check to get the idKey
    const idKey = "";



}

export function updateScoresDB(type: "BO" | "Overall", nameWinner: string, nameLoser: string, scoreWinner: number, scoreLoser: number): void {
    // TODO: Make the alphabetical check to get the idKey
    const idKey = "";

    const query = { name: idKey };
    let update = {}
    const options = { upsert: true }
    if (type === "BO") {
        update = { $set: { id: idKey, BOScores: { [nameWinner]: scoreWinner, [nameLoser]: scoreLoser}}}
    } else {
        update = { $set: { id: idKey, overallScores: { [nameWinner]: scoreWinner, [nameLoser]: scoreLoser}}}
    }

    collection.updateOne(query, update, options);
    return;
}

export async function connectToDB(client: MongoClient, manipulationDB: Function) {
    try {

        // await client.connect();
        console.log(uriMongoDB);
        await client.db("admin").command({ ping: 1})
        console.log("Connected to DB");
        // Function which do thing in the DB
        // FIXME: My current implementation doesn't work.
        if (manipulationDB) {
            // Attribute to a variable if we fetch value from the db
            const values: null | object = manipulationDB()
            if (values) {
                return constructStringDBValues(values);;
            }
        }
    } catch (error) {
        throw error;
    } finally {
        await client.close();
    }
}

