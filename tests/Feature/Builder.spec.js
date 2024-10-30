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
        expect(query).toBe(`SELECT "name", "email" FROM "users"`);
    });

    test("it adds order clause to end of query", () => {
        const builder = new Builder();
        const query = builder.from("users").orderBy("name", "DESC").toSql();
        expect(query).toBe(`SELECT * FROM "users" ORDER BY "name" DESC`);
    });

    test("it adds limit clause to end of query", () => {
        const builder = new Builder();
        const query = builder.from("users").limit(10).toSql();
        expect(query).toBe(`SELECT * FROM "users" LIMIT 10`);
    });

    test("it joins tables", () => {
        const builder = new Builder();
        const query = builder.from("snickers").join("Marsbars", "Marsbars.sugarGrams", "=", "snickers.sugarGrams").toSql();
        expect(query).toBe(`SELECT * FROM "snickers" INNER JOIN "Marsbars" ON "Marsbars"."sugarGrams" = "snickers"."sugarGrams"`);
    });

    test("it assembles select, where, order, limit, and join clauses correctly", () => {
        const builder = new Builder();
        const query = builder.from("snickers")
            .join("Marsbars", "Marsbars.sugarGrams", "=", "snickers.sugarGrams")
            .where("ooga", "booga")
            .select("sugarGrams", "calories")
            .orderBy("sugarGrams")
            .limit(4)
            .toSql();
        expect(query).toBe(`SELECT "sugarGrams", "calories" FROM "snickers" INNER JOIN "Marsbars" ON "Marsbars"."sugarGrams" = "snickers"."sugarGrams" WHERE "ooga" = "booga" ORDER BY "sugarGrams" ASC LIMIT 4`);
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
            builder.from("users").where("id", "=", 1, 2, 3).toSql();
        }).toThrowError("Invalid number of arguments");
    });

    test("it orders by descending", () => {
        const builder = new Builder();
        const query = builder.from("users").orderByDesc("name").toSql();

        expect(query).toBe(`SELECT * FROM "users" ORDER BY "name" DESC`);
    });

    test("it orders by ascending", () => {
        const builder = new Builder();
        const query = builder.from("users").orderByAsc("name").toSql();

        expect(query).toBe(`SELECT * FROM "users" ORDER BY "name" ASC`);
    });

    test("it enforces distinct", () => {
        const builder = new Builder();
        const query = builder.from("users").distinct().toSql();

        expect(query).toBe(`SELECT DISTINCT * FROM "users"`);
    });

    [
        {
            functionName: "leftJoin",
            join: "LEFT",
        },
        {
            functionName: "rightJoin",
            join: "RIGHT",
        },
        {
            functionName: "fullJoin",
            join: "FULL",
        },
        {
            functionName: "innerJoin",
            join: "INNER",
        },
        {
            functionName: "crossJoin",
            join: "CROSS",
        },
    ].forEach((joinType) => {
        test("it joins tables with " + joinType.join + " join", () => {
            const builder = new Builder();
            const query = builder.from("snickers")[joinType.functionName]("Marsbars", "Marsbars.sugarGrams", "=", "snickers.sugarGrams").toSql();

            expect(query)
                .toBe(`SELECT * FROM "snickers" ${joinType.join} JOIN "Marsbars" ON "Marsbars"."sugarGrams" = "snickers"."sugarGrams"`);
        });
    });

    test("it adds select columns to query", () => {
        const builder = new Builder();
        const query = builder.from("users").select("name", "email").addSelect("age").toSql();

        expect(query).toBe(`SELECT "name", "email", "age" FROM "users"`);
    });

    test("it formats where not statements", () => {
        const builder = new Builder();
        const query = builder.from("snickers").whereNot("calories", ">", 200).toSql();

        expect(query).toBe(`SELECT * FROM "snickers" WHERE NOT "calories" > 200`);
    });

    test("it organizes where and where not statements correctly when where is before whereNot", () => {
        const builder = new Builder();
        const query = builder.from("snickers")
            .where("calories", ">", 100)
            .whereNot("calories", ">", 200)
            .toSql();

        expect(query).toBe(`SELECT * FROM "snickers" WHERE "calories" > 100 AND NOT "calories" > 200`);
    });

    test("it organizes where and where not statements correctly when whereNot is before where", () => {
        const builder = new Builder();
        const query = builder.from("snickers")
            .whereNot("calories", ">", 200)
            .where("calories", ">", 100)
            .toSql();

        expect(query).toBe(`SELECT * FROM "snickers" WHERE NOT "calories" > 200 AND "calories" > 100`);
    })

    test("It structures update query correctly", async () => {
        const expectedQuery = "UPDATE \"some_table\" SET \"name\" = 'oogabooga' WHERE \"id\" = 1";

        const mockConnection = {
            connect: jest.fn().mockResolvedValue(true),
            disconnect: jest.fn().mockResolvedValue(true),
            query: jest.fn().mockResolvedValue({})
        };

        const builder = new Builder();
        builder.connection = mockConnection;

        await builder.from("some_table").where("id", 1).update({name: "oogabooga"});

        expect(mockConnection.query).toHaveBeenCalledWith(expectedQuery);
    });
});

describe("Builder, miscellaneous test cases", () => {
    test("it formats LE use case #1", () => {
        const builder = new Builder();
        const query = builder.from('addresses')
            .where('id', '>=', 1)
            .whereNotNull('phone_number')
            .where('phone_number', 'like', 'eyJ%')
            .toSql();

        expect(query).toBe(`SELECT * FROM "addresses" WHERE "id" >= 1 AND "phone_number" IS NOT NULL AND "phone_number" LIKE 'eyJ%'`);
    });
});