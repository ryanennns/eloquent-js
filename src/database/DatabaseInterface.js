import pg from "pg";
const {Client} = pg;

export class DatabaseInterface {
    constructor() {
        this.db = new Client({
            user: "postgres",
            host: "localhost",
            database: "eloquent-js",
            password: "asdfasdf",
            port: 5432
        });

        this.db.connect()
    }

    async query(queryString) {

        await this.db.query(queryString).then((res) => {
            console.log(res);
        });
    }
}