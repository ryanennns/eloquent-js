import pg from "pg";

const {Client} = pg;
const connectionDetails = {
    user: "postgres",
    host: "localhost",
    database: "postgres",
    password: "",
    port: 5432
};

// todo make abstract & make connectors for MySQL, PostgreSQL, SQLite, etc.
export class DatabaseInterface {
    constructor() {
        this.db = null;
    }

    async connect() {
        this.db = new Client(connectionDetails);
        await this.db.connect();
    }

    async disconnect() {
        await this.db.end();
        this.db = new Client(connectionDetails);
    }

    async query(queryString) {
        return await this.db.query(queryString);
    }
}