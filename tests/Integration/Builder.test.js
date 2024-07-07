import {Builder} from "../../src/Builder.js";

describe("Builder", () => {
    test("it gets rows from database", async () => {
        const expectedUser = {
            username: "oogabooga", email: `${Math.random()}@oogabooga.com`, status: "active"
        };

        const createBuilder = new Builder();
        await createBuilder.from("users").create(expectedUser);

        const getBuilder = new Builder();
        let rows = await getBuilder.from("users").where("username", "oogabooga").get();

        rows = rows.map(row => {
            return {
                username: row.username, email: row.email, status: row.status,
            };
        });

        expect(rows).toContainEqual(expectedUser);
    });

    test("it deletes rows from database", async () => {
        const expectedUser = {
            username: "oogabooga", email: `${Math.random()}@oogabooga.com`, status: "active"
        };

        const createBuilder = new Builder();
        await createBuilder.from("users").create(expectedUser);

        const getBuilder = new Builder();
        let rows = await getBuilder.from("users").where("username", "oogabooga").get();

        rows = rows.map(row => {
            return {
                username: row.username, email: row.email, status: row.status,
            };
        });

        expect(rows).toContainEqual(expectedUser);

        const deleteBuilder = new Builder();
        await deleteBuilder.from("users").where("username", expectedUser.username).delete();

        rows = await getBuilder.from("users").where("username", expectedUser.username).get();

        rows = rows.map(row => {
            return {
                username: row.username, email: row.email, status: row.status,
            };
        });

        expect(rows).not.toContainEqual(expectedUser);
    });
});