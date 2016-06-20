/// <reference path="../typings/index.d.ts" />

const chai  = require('chai');
const expect = chai.expect;
const del = require('del');

const sqlite3 = require('sqlite3');
const sqliter = require('../lib/node-sqliter');


describe('node-sqliter', () => {
    const filename = './test/test.db';
    const tableName = 'testtable';

    var db, db3;

    before(() => {
        db = sqliter.connect(filename);
        db3 = new sqlite3.Database(filename);
    });

    after(() => {
        del.sync([filename]);
    });

    it('create table', (done) => {
        const query = `select count(*) from sqlite_master where type="table" and name = "${tableName}"`;
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
            db.createTable(tableName, model, (err, res) => {
                resolve();
            });
        });
        create.then(() => {
            db3.get(query, (err, res) => {
                expect(res['count(*)']).to.be.eq(1);
                done();
            });
        });
    });

    it('insert value', (done) => {
        const query = `select id, name from ${tableName}`;
        const model = {
            id: '123',
            name: 'test'
        };

        const save = new Promise((resolve, reject) => {
            db.save(tableName, model, (err, res) => {
                resolve();
            });
        });
        save.then(() => {
            db3.get(query, (err, res) => {
                expect(res['id']).to.be.eq(123);
                expect(res['name']).to.be.eq('test');
                done();
            });
        });
    });

    it('find value', (done) => {
        const wheres = ['id = 123'];
        const query = `select * from ${tableName} where ${wheres.join(' ')}`;

        const find = new Promise((resolve, reject) => {
            db.find(tableName,  wheres, (err, row) => {
                resolve(row);
            });
        });
        find.then((result) => {
            db3.get(query, (err, row) => {
                expect(result['id']).to.be.eq(row['id']);
                expect(result['name']).to.be.eq(row['name']);
                done();
            });
        });
    });
});

