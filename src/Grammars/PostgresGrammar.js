import {Grammar} from "./Grammar.js";

export class PostgresGrammar extends Grammar {
    constructor() {
        super();
    }

    structureCreateQuery(builder) {
        const keys = Object.keys(builder.createKeysAndValues);
        const values = Object
            .values(builder.createKeysAndValues)
            .map(value => typeof value === "string" ? `'${value}'` : value);

        return `INSERT INTO "${builder.table}" (${keys.join(", ")}) VALUES (${values.join(", ")})`;
    }

    structureSelectQuery(builder) {
        const constraints = this.#formatConstraints(builder);

        const columns = this.#formatSelectColumns(builder);

        let queryString = `SELECT ${columns} FROM "${builder.table}"`;

        builder.joinedTables.forEach(joinedTable => {
            let column1 = joinedTable.column1.split(".").map((item) => `"${item}"`).join(".");
            let column2 = joinedTable.column2.split(".").map((item) => `"${item}"`).join(".");

            queryString += ` ${joinedTable.type} JOIN "${joinedTable.table}" ON ${column1} ${joinedTable.operator} ${column2}`;
        });

        if (constraints) {
            queryString += ` WHERE ${constraints}`;
        }

        if (builder.orderClause) {
            queryString += ` ${builder.orderClause}`;
        }

        if (builder.limitClause) {
            queryString += ` ${builder.limitClause}`;
        }


        return queryString;
    }

    #formatSelectColumns(builder) {
        return builder.selectedColumns.length ? builder.selectedColumns.map((item) => `"${item}"`).join(", ") : "*";
    }

    #formatConstraints(builder) {
        return builder.constraints.map(constraint => {
            if (
                typeof constraint.value == "string"
                && constraint.operator !== "IN"
            ) {
                if (builder.joinedTables.length > 0) {
                    return `"${constraint.column}" ${constraint.operator} "${constraint.value}"`;
                }
                return `"${constraint.column}" ${constraint.operator} '${constraint.value}'`;
            }

            return `"${constraint.column}" ${constraint.operator} ${constraint.value}`;
        }).join(" AND ");
    }

    structureDeleteQuery(builder) {
        const constraints = this.#formatConstraints(builder);

        return `DELETE FROM "${builder.table}" WHERE ${constraints}`;
    }
}