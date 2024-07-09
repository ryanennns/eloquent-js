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
        this.table = "";
        this.constraints = [];
        this.selectedColumns = [];
        this.orderClause = "";
        this.limitClause = "";
        this.joinedTables = [];
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

    async get() {
        return (await this.#executeQuery(this.#structureQuery())).rows;
    }

    async create(args) {
        return await this.#executeQuery(this.#structureCreateQuery(args));
    }

    async delete() {
        return await this.#executeQuery(this.#structureDeleteQuery());
    }

    #structureQuery() {
        const constraints = this.#formatConstraints();

        const columns = this.#formatSelectColumns();

        let queryString = `SELECT ${columns} FROM "${this.table}"`;

        this.joinedTables.forEach(joinedTable => {

            let column1 = joinedTable.column1.split('.').map((item) => `"${item}"`).join('.');
            let column2 = joinedTable.column2.split('.').map((item) => `"${item}"`).join('.');

            queryString += ` ${joinedTable.type} JOIN "${joinedTable.table}" ON ${column1} ${joinedTable.operator} ${column2}`;
        });

        if (constraints) {
            queryString += ` WHERE ${constraints}`;
        }

        if (this.orderClause) {
            queryString += ` ${this.orderClause}`;
        }

        if (this.limitClause) {
            queryString += ` ${this.limitClause}`;
        }


        return queryString;
    }

    #formatSelectColumns() {

        return this.selectedColumns.length ? this.selectedColumns.map((item) => `"${item}"`).join(", ") : "*";
    }

    #formatConstraints() {
        return this.constraints.map(constraint => {
            if (
                typeof constraint.value == "string"
                && constraint.operator !== "IN"
            ) {
                if (this.joinedTables.length > 0) {
                    return `"${constraint.column}" ${constraint.operator} "${constraint.value}"`;
                }
                return `"${constraint.column}" ${constraint.operator} '${constraint.value}'`;
            }

            return `"${constraint.column}" ${constraint.operator} ${constraint.value}`;
        }).join(" AND ");
    }

    #structureCreateQuery(args) {
        const keys = Object.keys(args);
        const values = Object.values(args).map(value => typeof value === "string" ? `'${value}'` : value);

        return `INSERT INTO "${this.table}" (${keys.join(", ")})
                VALUES (${values.join(", ")})`;
    }

    #structureDeleteQuery() {
        const constraints = this.#formatConstraints();

        return `DELETE
                FROM "${this.table}"
                WHERE ${constraints}`;
    }

    async #executeQuery(queryString) {
        await this.connection.connect();

        const connectionReturnValue = await this.connection.query(queryString);

        await this.connection.disconnect();

        return connectionReturnValue;
    }

    toSql() {
        return this.#structureQuery();
    }
}