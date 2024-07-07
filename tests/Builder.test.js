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

    test("it throws error if unsupported operator used", () => {
        const builder = new Builder();
        expect(() => {
            builder.from("users").where("id", "poop", 1).toSql();
        }).toThrowError("Invalid operator");
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

    test("it gets rows from database", async () => {
        const expectedUser = {
            username: "oogabooga",
            email: `${Math.random()}@oogabooga.com`,
            status: "active"
        };

        const createBuilder = new Builder();
        await createBuilder.from("users").create(expectedUser);

        const getBuilder = new Builder();
        let rows = await getBuilder.from("users").where("username", "oogabooga").get();

        rows = rows.map(row => {
            return {
                username: row.username,
                email: row.email,
                status: row.status,
            };
        });

        expect(rows).toContainEqual(expectedUser);
    });

    test("it deletes rows from database", async () => {
        const expectedUser = {
            username: "oogabooga",
            email: `${Math.random()}@oogabooga.com`,
            status: "active"
        };

        const createBuilder = new Builder();
        await createBuilder.from("users").create(expectedUser);

        const getBuilder = new Builder();
        let rows = await getBuilder.from("users").where("username", "oogabooga").get();

        rows = rows.map(row => {
            return {
                username: row.username,
                email: row.email,
                status: row.status,
            };
        });

        expect(rows).toContainEqual(expectedUser);

        const deleteBuilder = new Builder();
        await deleteBuilder.from("users").where("username", expectedUser.username).delete();

        rows = await getBuilder.from("users").where("username", expectedUser.username).get();

        rows = rows.map(row => {
            return {
                username: row.username,
                email: row.email,
                status: row.status,
            };
        });

        expect(rows).not.toContainEqual(expectedUser);
    });
});