/// <reference path="../typings/index.d.ts" />

import * as chai from 'chai';
import * as del from 'del';

import * as sqlite3 from 'sqlite3';
import * as sqliter from '../src/node-sqliter';

const expect = chai.expect;

describe('node-sqliter', () => {
    const file = './test/test.db';
    const table = 'testtable';

    let db: sqliter.ISqliter;
    let db3: sqlite3.Database;

    before(() => {
        db = sqliter.connect(file);
        db3 = new sqlite3.Database(file);
    });

    after(() => {
        del.sync([file]);
    });

    it('create table', (done) => {
        const query = `select count(*) from sqlite_master where type="table" and name = "${table}"`;
        const model = [
            {
                field: 'id',
                type : sqliter.Types.INTEGER
            },
            {
                field: 'name',
                type : sqliter.Types.TEXT
            }
        ];

        const create = new Promise((resolve, reject) => {
            db.createTable(table, model, (err) => {
                resolve();
            });
        });
        create.then(() => {
            db3.get(query, (err, row) => {
                expect(row['count(*)']).to.be.eq(1);
                done();
            });
        });
    });

    it('insert value', (done) => {
        const query = `select id, name from ${table}`;
        const model = {
            id: '1',
            name: 'test01'
        };

        const save = new Promise((resolve, reject) => {
            db.save(table, model, (err) => {
                resolve();
            });
        });
        save.then(() => {
            db3.get(query, (err, row) => {
                expect(row['id']).to.be.eq(1);
                expect(row['name']).to.be.eq('test01');
                done();
            });
        });
    });

    it('insert all', (done) => {
        const query = `select count(*) from ${table}`;
        const models = [
            {id: '2', name: 'test02'},
            {id: '3', name: 'test03'},
            {id: '4', name: 'test04'}
        ];

        const saveAll = new Promise((resolve, reject) => {
            db.saveAll(table, models, () => {
                resolve();
            });
        });
        saveAll.then(() => {
            db3.get(query, (err, row) => {
                expect(row['count(*)']).to.be.eq(4);
                done();
            });
        });
    });

    it('find value', (done) => {
        const wheres = ['id = 2'];
        const query = `select * from ${table} where ${wheres.join(' ')}`;

        const find = new Promise((resolve, reject) => {
            db.find(table,  wheres, (err, row) => {
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