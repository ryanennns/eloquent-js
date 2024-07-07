import {Builder} from "../../src/Builder.js";

describe("Builder", () => {
    test("formats where in statements", () => {
        const builder = new Builder();
        const query = builder.from("users").whereIn("id", [1, 2, 3]).toSql();
        expect(query).toBe(`SELECT * FROM "users" WHERE "id" IN (1, 2, 3)`);
    });

    test("formats where in statements with strings", () => {
        const builder = new Builder();
        const query = builder.from("users").whereIn("name", ["Alice", "Bob"]).toSql();
        expect(query).toBe(`SELECT * FROM "users" WHERE "name" IN ('Alice', 'Bob')`);
    });

    test("strings together multiple where statements", () => {
        const builder = new Builder();
        const query = builder.from("users").where("id", 1).where("name", "Alice").toSql();
        expect(query).toBe(`SELECT * FROM "users" WHERE "id" = 1 AND "name" = 'Alice'`);
    });

    test("it assumes equals operator if none is provided", () => {
        const builder = new Builder();
        const query = builder.from("users").where("id", 1).toSql();
        expect(query).toBe(`SELECT * FROM "users" WHERE "id" = 1`);
    });

    test("it selects specific columns", () => {
        const builder = new Builder();
        const query = builder.from("users").select("name", "email").toSql();
        expect(query).toBe(`SELECT name, email FROM "users"`);
    });

    test("it adds order clause to end of query", () => {
        const builder = new Builder();
        const query = builder.from("users").orderBy("name", "DESC").toSql();
        expect(query).toBe(`SELECT * FROM "users" ORDER BY name DESC`);
    });

    test("it adds limit clause to end of query", () => {
        const builder = new Builder();
        const query = builder.from("users").limit(10).toSql();
        expect(query).toBe(`SELECT * FROM "users" LIMIT 10`);
    });

    test("it throws error if unsupported operator used", () => {
        const builder = new Builder();
        expect(() => {
            builder.from("users").where("id", "poop", 1).toSql();
        }).toThrowError("Invalid operator");
    });

    test("it throws error if invalid order direction", () => {
        const builder = new Builder();
        expect(() => {
            builder.from("users").orderBy("name", "POOP").toSql();
        }).toThrowError("Invalid order direction");
    });

    test("it throws error if too few number of arguments passed to where", () => {
        const builder = new Builder();
        expect(() => {
            builder.from("users").where("id").toSql();
        }).toThrowError("Invalid number of arguments");
    });

    test("it throws error if too many number of arguments passed to where", () => {
        const builder = new Builder();
        expect(() => {
            builder.from("users").where("id", "=", 1, 2).toSql();
        }).toThrowError("Invalid number of arguments");
    });
});