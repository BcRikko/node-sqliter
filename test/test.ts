/// <reference path="../typings/index.d.ts" />

import * as chai from 'chai';
import * as del from 'del';

import * as sqlite3 from 'sqlite3';
import * as sqliter from '../src/node-sqliter';

require('babel-polyfill');  // regeneratorRuntime is not defined 対策
const co = require('co');

const expect = chai.expect;


interface IField {
    id?  : number,
    name?: string
}

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

        db.createTable(table, models).then(() => {
            db3.get(query, (err, row) => {
                expect(row['count(*)']).to.be.eq(1);
                done();
            });

        }).catch((err) => {
            console.log(err);
        });
    });

    it('insert value', (done) => {
        const query = `select id, name from ${table}`;
        const field: IField = {
            id: 1,
            name: 'test01'
        };

        db.save(table, field).then(() => {
            db3.get(query, (err, row) => {
                expect(row.id).to.be.eq(1);
                expect(row.name).to.be.eq('test01');
                done();
            });

        }).catch((err) => {
            console.log(err);
        });
    });

    it('insert all', (done) => {
        const query = `select count(*) from ${table}`;
        const fields: IField[] = [
            {id: 2, name: 'test02'},
            {id: 3, name: 'test03'},
            {id: 4, name: 'test04'},
            {id: 5, name: 'test05'},
            {id: 6, name: 'test06'},
            {id: 7, name: 'test07'},
            {id: 8, name: 'test08'},
            {id: 9, name: 'test09'},
            {id:10, name: 'test10'},
        ];

        db.saveAll(table, fields).then(() => {
            db3.get(query, (err, row) => {
                expect(row['count(*)']).to.be.eq(10);
                done();
            });

        }).catch((err) => {
            console.log(err);
        });
    });

    it('find value', (done) => {
        const wheres = ['id = 2'];
        const query = `select * from ${table} where ${wheres.join(' ')}`;

        db.find<IField>(table, wheres).then((result) => {
            db3.get(query, (err, row) => {
                expect(result.id).to.be.eq(row.id);
                expect(result.name).to.be.eq(row.name);
                done();
            });

        }).catch((err) => {
            console.log(err);
        });
    });

    it('find all value', (done) => {
        const wheres = ['id > 2', 'id < 5'];
        const query = `select * from ${table} where ${wheres.join(' AND ')}`;

        db.findAll<IField>(table, wheres).then((results) => {
            db3.all(query, (err, rows) => {
                expect(results.length).to.be.eq(rows.length);

                results.forEach((result, i) => {
                    expect(result).to.deep.equal(rows[i]);
                });

                done();
            });

        }).catch((err) => {
            console.log(err);
        });
    });

    it('update value', (done) => {
        const wheres = ['id = 3'];
        const query = `select * from ${table} where ${wheres.join(' ')}`;

        const fields: IField = {
            name: 'updated'
        };

        db.update(table, fields, wheres).then(() => {
            db3.get(query, (err, row) => {
                expect(row.name).to.be.eq('updated');
                done();
            });

        }).catch((err) => {
            console.log(err);
        });
    });

    it('delete value', (done) => {
        const wheres = ['id = 3'];
        const query = `select count(*) from ${table} where ${wheres.join(' ')}`;

        db.del(table, wheres).then(() => {
            db3.get(query, (err, row) => {
                expect(row['count(*)']).to.be.eq(0);
                done();
            });

        }).catch((err) => {
            console.log(err);
        });
    });

    it('serial processing', (done) => {
        const field: IField = {
            id: 1,
            name: 'test01'
        };

        co(function *() {
            yield db.save(table, field);

            const res1 = yield db.find(table, ['id = 1']);
            expect(res1.id).to.be.eq(1);
            expect(res1.name).to.be.eq('test01');

            yield db.update(table, { name: 'updated' }, ['id = 1']);


            const res2 = yield db.find(table, ['id = 1']);
            expect(res2.id).to.be.eq(1);
            expect(res2.name).to.be.eq('updated');

            yield db.del(table, []);

            yield done();
        });
    });

    it('parallels processing', (done) => {
        const query = `select count(*) from ${table}`;

        const field1: IField = {
            id: 1,
            name: 'test01'
        };
        const field2: IField = {
            id: 2,
            name: 'test02'
        };
        const field3: IField = {
            id: 3,
            name: 'test03'
        };

        const saveTasks = [
            db.save(table, field1),
            db.save(table, field2),
            db.save(table, field3)
        ];

        Promise.all(saveTasks).then(() => {
            db3.get(query, (err, row) => {
                expect(row['count(*)']).to.be.eq(3);
            });
        });

        const findTasks = [
            db.find(table, ['id = 1']),
            db.find(table, ['id = 2']),
            db.find(table, ['id = 3'])
        ];

        Promise.all(findTasks).then((results) => {
            results.sort((a: any, b: any) => {
                return a.id > b.id ? 1 : 0

            }).forEach((result: any, i) => {
                expect(result.id).to.be.eq(i + 1);
                expect(result.name).to.be.eq(`test0${i + 1}`);
            });
            done();
        });
    });
});