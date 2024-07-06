import {Builder} from "../src/Builder.js";

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
});