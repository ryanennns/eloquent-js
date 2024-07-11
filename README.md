# `eloquent-js`

`eloquent-js` is a simple and lightweight query builder for JavaScript, based off of Laravel's *Eloquent ORM*.

```javascript
import { Builder } from 'eloquent-js';

const builder = new Builder();

const users = builder.table('users')
    .select('name', 'email', 'address_id')
    .where('email', 'john@doe.com')
    .orderBy('name', 'asc')
    .limit(3)
    .get();
```