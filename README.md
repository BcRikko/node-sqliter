node-sqliter
====

A small wrapper library for [node-sqlite3](https://github.com/mapbox/node-sqlite3) in node.js(typescript)


Installation
----
またnpmに登録していないので手動でビルドする必要があります。

```
$ git clone git@github.com:BcRikko/node-sqliter.git
$ cd node-sqliter
$ npm install
$ npm run build
```


Dependencies
----

* node >= v5.3
* node-sqlite3 v3.1.4


Usage
----

npmに登録していないのでビルドしたときに`.lib/node-sqliter`をimportして使ってください。

```js
import * as sqliter from './lib/node-sqliter';
const db = sqliter.connect('test.db');
```


### Create table

```js
const models: sqliter.IModel[] = [
    {
        field: 'id',
        type : sqliter.Types.INTEGER
    },
    {
        field: 'name',
        type : sqliter.Types.TEXT
    }
];
db.createTable('ex-table', models, (err) => {
    console.log(err);
});
```


### CRUD

```js
interface IField {
    id: number,
    name: string
}

// save
const field: IField = {
    id: 10,
    name: 'test01'
};
db.save('test.db', field, (err) => {
    console.log(err);
});

// multiple save
const fields: IField[] = [
    { id: 11, name: 'test02' },
    { id: 12, name: 'test03' },
    { id: 13, name: 'test04' }
];
db.saveAll('test.db', fields, (err) => {
    console.log(err);
})

// find
const where = ['id = 11'];
db.find('test.db', where, (err, row) => {
    console.log(row['id']);
    console.log(row['name']);
});

// find all
const wheres = ['id = 11', 'AND name = "test03"'];
db.findAll('test.db', wheres, (err, rows) => {
    rows.forEach((row) => {
        console.log(row['id'], row['name']);
    });
});

// update
const wheres = ['id = 11'];
const updateField = { name: 'updated' };
db.update('test.db', updateField, wheres, (err) => {
    console.log(err);
});
```


Testing
----

```
$ npm run test
```