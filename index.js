import {DB} from "./src/DB.js";

await DB.table("users").create({
    username: "oogabooga",
    email: `${Math.random()}@oogabooga.com`,
    status: "active"
});

const q = await DB.table("users")
    .where("username", "oogabooga")
    .whereIn("status", ["active", "inactive"])
    .get();

console.log(q.rows);

await DB.table("users").where("username", "oogabooga").delete();
