const supportedOperators = [
    "=",
    "!=",
    ">",
    "<",
];

export class Builder {

    constructor() {
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
        if (args.length > 3) {
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

    create() {

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

    toSql() {
        return this.#structureQuery();
    }
}