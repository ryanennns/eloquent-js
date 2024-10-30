import {DatabaseInterface} from "./database/DatabaseInterface.js";
import {PostgresGrammar} from "./Grammars/PostgresGrammar.js";

const supportedOperators = [
    "=",
    "!=",
    ">",
    "<",
    ">=",
    "<=",
    "like",
];

export class Builder {
    constructor(databaseInterface = null, grammar= null) {
        this.connection = databaseInterface ?? new DatabaseInterface();
        this.grammar = grammar ?? new PostgresGrammar();

        this.table = "";
        this.isDistinct = false;
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
        if (args.length > 4 || args.length < 2) {
            throw new Error("Invalid number of arguments");
        }

        let column = args[0];

        if (args.length === 2) {
            this.constraints.push({
                column,
                operator: "=",
                value: args[1],
                not: false,
            });
        }

        if (args.length >= 3) {
            let operator = args[1];
            let not = args[3] ?? false;

            if (!supportedOperators.includes(operator)) {
                throw new Error("Invalid operator");
            }

            this.constraints.push({
                column,
                operator,
                value: args[2],
                not,
            });
        }

        return this;
    }

    whereNot(...args) {
        if (args.length > 3) {
            throw new Error("Invalid number of arguments");
        }

        if (args.length === 3) {
            this.where(args[0], args[1], args[2], true);
        }

        if (args.length === 2) {
            this.where(args[0], "=", args[1], true);
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

    whereNotNull(column) {
        return this.where(column, '!=', 'NULL');
    }

    select(...columns) {
        this.selectedColumns = columns;

        return this;
    }

    addSelect(column) {
        this.selectedColumns.push(column);

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

    orderByDesc(column) {
        return this.orderBy(column, "DESC");
    }

    orderByAsc(column) {
        return this.orderBy(column, "ASC");
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

    leftJoin(
        table,
        column1,
        operator,
        column2,
    ) {
        return this.join(table, column1, operator, column2, "LEFT");
    }

    rightJoin(
        table,
        column1,
        operator,
        column2,
    ) {
        return this.join(table, column1, operator, column2, "RIGHT");
    }

    fullJoin(
        table,
        column1,
        operator,
        column2,
    ) {
        return this.join(table, column1, operator, column2, "FULL");
    }

    innerJoin(
        table,
        column1,
        operator,
        column2,
    ) {
        return this.join(table, column1, operator, column2, "INNER");
    }

    crossJoin(
        table,
        column1,
        operator,
        column2,
    ) {
        return this.join(table, column1, operator, column2, "CROSS");
    }

    distinct() {
        this.isDistinct = true;

        return this;
    }

    toSql() {
        return this.grammar.structureSelectQuery(this);
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

    async create(args) {
        this.createKeysAndValues = args;

        return await this.#executeQuery(this.#createQuery());
    }

    async get() {
        return (await this.#executeQuery(this.#selectQuery())).rows;
    }

    async update(newValues) {
        return await this.#executeQuery(this.#updateQuery(newValues));
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

    async each(callback) {
        const results = await this.get();

        results.forEach(callback);
    }

    #createQuery() {
        return this.grammar.structureCreateQuery(this);
    }

    #selectQuery() {
        return this.grammar.structureSelectQuery(this);
    }

    #updateQuery(newValues) {
        return this.grammar.structureUpdateQuery(this, newValues);
    }

    #deleteQuery() {
        return this.grammar.structureDeleteQuery();
    }
}