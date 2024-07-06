import {Builder} from "../src/Builder.js";

test("it formats where in statements", () => {
    const builder = new Builder();
    const query = builder.from("users").whereIn("id", [1, 2, 3]).toSql();
    expect(query).toBe('SELECT * FROM "users" WHERE "id" IN (1, 2, 3)');
});
