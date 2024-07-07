import pg from "pg";

const {Client} = pg;

const db = new Client({
    user: "postgres",
    host: "localhost",
    database: "eloquent-js",
    password: "asdfasdf",
    port: 5432
});

db.connect();

db.end()
