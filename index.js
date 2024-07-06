import {DB} from "./src/DB.js";
import {DatabaseInterface} from "./src/database/DatabaseInterface.js";

const q = DB.table("users")
    .where("username", "oogabooga")
    .where("id", ">", 5)
    .whereIn("status", ["active", "inactive", 4])
    .select("id")
    .toSql();

console.log(q);

// const db = new DatabaseInterface();
// await db.query(q);