/// <reference path="../typings/index.d.ts" />

const chai  = require('chai');
const expect = chai.expect;
const del = require('del');

const sqlite3 = require('sqlite3');
const sqliter = require('../lib/node-sqliter');


describe('node-sqliter', () => {
    const filename = ':memory:';
    const tableName = 'testtable';

    var db, db3;

    before(() => {
        db = sqliter.connect(filename);
        db3 = new sqlite3.Database(filename);
    });

    after(() => {
        del.sync([filename]);
    });

    it('create table', () => {
        const query = `select count(*) from sqlite_master where type="table" and name = ${tableName}`;
        const model = [
            {
                field: 'id',
                type : sqliter.TYPE.INTEGER
            },
            {
                field: 'name',
                type : sqliter.TYPE.TEXT
            }
        ];

        const create = new Promise((resolve, reject) => {
            db.createTable(tableName, model, () => {
                resolve();
            });
        });

        create.then(() => {
            db3.get(query, (err, res) => {
                expect(res['count(*)']).to.be.eq(1);
            });
        });
    });
});

