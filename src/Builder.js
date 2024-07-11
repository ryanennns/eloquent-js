import {DatabaseInterface} from "./database/DatabaseInterface.js";
import {PostgresGrammar} from "./Grammars/PostgresGrammar.js";

const supportedOperators = [
    "=",
    "!=",
    ">",
    "<",
];

export class Builder {
    constructor() {
        this.connection = new DatabaseInterface();
        this.grammar = new PostgresGrammar();

        this.table = "";
        this.constraints = [];
        this.selectedColumns = [];
        this.orderClause = "";
        this.limitClause = "";
        this.joinedTables = [];
        this.createKeysAndValues = [];
    }

    from(table) {
        this.table = table;

        return this;
    }

    where(...args) {
        if (args.length > 3 || args.length <= 1) {
            throw new Error("Invalid number of arguments");
        }

        let column = args[0];

        if (args.length === 2) {
            this.constraints.push({
                column,
                operator: "=",
                value: args[1]
            });
        }

        if (args.length === 3) {
            let operator = args[1];
            if (!supportedOperators.includes(operator)) {
                throw new Error("Invalid operator");
            }

            this.constraints.push({
                column,
                operator,
                value: args[2]
            });
        }

        return this;
    }

    whereIn(column, values) {
        values = values.map(value => typeof value === "string" ? `'${value}'` : value);

        this.constraints.push({
            column,
            operator: "IN",
            value: `(${values.join(", ")})`
        });

        return this;
    }

    select(...columns) {
        this.selectedColumns = columns;

        return this;
    }

    limit(limit) {
        this.limitClause = `LIMIT ${limit}`;

        return this;
    }

    orderBy(column, direction = "ASC") {
        if (!["ASC", "DESC"].includes(direction)) {
            throw new Error("Invalid order direction");
        }

        this.orderClause = `ORDER BY "${column}" ${direction}`;

        return this;
    }

    join(
        table,
        column1,
        operator,
        column2,
        type = "INNER",
        where = true,
    ) {
        this.joinedTables.push({
            table,
            column1,
            operator,
            column2,
            type,
            where,
        });

        return this;
    }

    async first() {
        try {
            return (await this.#executeQuery(this.grammar.structureSelectQuery(this))).rows[0];
        } catch (error) {
            return null;
        }
    }

    async find(id, columns = ["*"]) {
        this.constraints.push({
            column: "id",
            operator: "=",
            value: id
        });

        this.selectedColumns = columns;

        return await this.first();
    }

    async get() {
        return (await this.#executeQuery(this.#selectQuery())).rows;
    }

    async create(args) {
        this.createKeysAndValues = args;

        return await this.#executeQuery(this.#createQuery());
    }

    async delete() {
        return await this.#executeQuery(this.#deleteQuery());
    }

    async #executeQuery(queryString) {
        await this.connection.connect();

        const connectionReturnValue = await this.connection.query(queryString);

        await this.connection.disconnect();

        return connectionReturnValue;
    }

    toSql() {
        return this.grammar.structureSelectQuery(this);
    }

    #selectQuery() {
        return this.grammar.structureSelectQuery(this);
    }

    #createQuery() {
        return this.grammar.structureCreateQuery(this);
    }

    #deleteQuery() {
        return this.grammar.structureDeleteQuery();
    }
}