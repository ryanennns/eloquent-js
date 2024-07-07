import {DatabaseInterface} from "./database/DatabaseInterface.js";

const supportedOperators = [
    "=",
    "!=",
    ">",
    "<",
];

export class Builder {

    constructor() {
        this.connection = new DatabaseInterface();
        this.joinedTables = [];
        this.constraints = [];
        this.selectedColumns = [];
        this.table = "";
        this.queryString = "";
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

    async get() {
        return await this.connection.query(this.#structureQuery());
    }

    async create(args) {
        return await this.connection.query(this.#structureCreateQuery(args));
    }

    async delete() {
        return await this.connection.query(this.#structureDeleteQuery());
    }

    #structureQuery() {
        const constraints = this.#formatConstraints();

        const columns = this.#formatSelectColumns();

        let queryString = `SELECT ${columns} FROM "${this.table}"`;

        if (constraints) {
            queryString += ` WHERE ${constraints}`;
        }

        return queryString;
    }

    #formatSelectColumns() {
        return this.selectedColumns.length ? this.selectedColumns.join(", ") : "*";
    }

    #formatConstraints() {
        return this.constraints.map(constraint => {
            if (
                typeof constraint.value == "string"
                && constraint.operator !== "IN"
            ) {
                return `"${constraint.column}" ${constraint.operator} '${constraint.value}'`;
            }

            return `"${constraint.column}" ${constraint.operator} ${constraint.value}`;
        }).join(" AND ");
    }

    #structureCreateQuery(args) {
        const keys = Object.keys(args);
        const values = Object.values(args).map(value => typeof value === "string" ? `'${value}'` : value);

        return `INSERT INTO "${this.table}" (${keys.join(", ")}) VALUES (${values.join(", ")})`;
    }

    #structureDeleteQuery() {
        const constraints = this.#formatConstraints();

        return `DELETE FROM "${this.table}" WHERE ${constraints}`;
    }

    toSql() {
        return this.#structureQuery();
    }
}