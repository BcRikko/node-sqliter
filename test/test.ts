/// <reference path="../typings/index.d.ts" />

import * as chai from 'chai';
import * as del from 'del';

import * as sqlite3 from 'sqlite3';
import * as sqliter from '../src/node-sqliter';

const expect = chai.expect;

interface IField {
    id: number,
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

        db.find(table, wheres).then((result: IField) => {
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

        db.findAll(table, wheres).then((results: IField[]) => {
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

        const fields = {
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

});