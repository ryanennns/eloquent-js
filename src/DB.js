import { Builder } from './Builder.js';

export class DB
{
    static query() {
        return new Builder();
    }

    static table(table) {
        return new Builder().from(table);
    }
}