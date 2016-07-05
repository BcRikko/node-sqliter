/// <reference path="../typings/index.d.ts" />
"use strict"

import * as sqlite3 from "sqlite3";

export module Types {
    export const NONE = 'NONE';
    export const TEXT = 'TEXT';
    export const INTEGER = 'INTEGER';
    export const REAL = 'REAL';
    export const BLOB = 'BLOB';
}

export interface IModel {
    field: string,
    type: string,
    options?: string
}

export interface ISqliter {
    createTable (table: string, models: IModel[], callback?: (err: Error) => void);
    save (table: string, field: any, callback?: (err: Error) => void);
    saveAll (table: string, fields: any[], callback?: (err: Error) => void);
    find (table: string, wheres: any[], callback?: (err: Error, row: any) => void);
    findAll (table: string, wheres: any[], callback?: (err: Error, rows: any[]) => void);
    update (table: string, field: any, wheres?: any[], callback?: (err: Error) => void);
    del (table: string, wheres?: any[], callback?: (err: Error) => void);
    run (query: string, callback?:  (err: Error) => void);
    get (query: string, callback?: (err: Error, row: any) => void);
    all (query: string, callback?: (err: Error, rows: any[]) => void);
    each (query: string, callback?: (err: Error, row: any) => void, complete?: (err: Error, count: number) => void);
    close (callback?: (err: Error) => void);
}

/**
 * Sqliter
 */
class Sqliter implements ISqliter{
    private _db: sqlite3.Database;

    constructor(filename) {
        this._db = new sqlite3.Database(filename);
    }

    createTable (table: string, models: IModel[], callback?: (err: Error) => void) {
        const params = models.map(model => {
            return [
                model.field,
                model.type,
                model.options
            ].join(' ');
        });

        const query = `CREATE TABLE IF NOT EXISTS ${table} ( ${params} )`;

        this._db.run(query, callback);
    }

    save (table: string, field: any, callback?: (err: Error) => void) {
        const keys = Object.keys(field);
        const values = keys.map((key) => { return `"${field[key]}"`; });

        const query = `INSERT INTO ${table} ( ${keys.join(',')} ) VALUES ( ${values.join(',')} )`;

        this._db.run(query, callback);
    }

    saveAll (table: string, fields: any[], callback?: (err: Error) => void) {
        const keys = Object.keys(fields[0]);
        const holder = keys.map(() => {return '?'; }).join(',');

        let statement = this._db.prepare(`INSERT INTO ${table} ( ${keys.join(',')} ) VALUES ( ${holder} )`);
        fields.forEach((model) => {
            const values = keys.map((key) => { return `${model[key]}`; });
            statement.run(values);
        });

        statement.finalize(callback);
    }

    find (table: string, wheres: any[], callback?: (err: Error, row: any) => void) {
        const where = this._joinWhere(wheres);
        const query = `SELECT * FROM ${table} WHERE ${where}`;

        this._db.get(query, callback);
    }

    findAll (table: string, wheres: any[], callback?: (err: Error, rows: any[]) => void) {
        const where = this._joinWhere(wheres);
        const query = `SELECT * FROM ${table} WHERE ${where}`;

        this._db.all(query, callback);
    }

    update (table: string, field: any, wheres?: any[], callback?: (err: Error) => void) {
        let param = [];
        for (let key in field) {
            param.push(`${key} = "${field[key]}"`);
        }
        const where = this._joinWhere(wheres);
        const query = `UPDATE ${table} SET ${param.join(',')} WHERE ${where}`;

        this._db.run(query, callback);
    }

    del (table: string, wheres?: any[], callback?: (err: Error) => void) {
        const where = this._joinWhere(wheres);
        const query = `DELETE FROM ${table} WHERE ${where}`;

        this._db.run(query, callback);
    }

    run (query: string, callback?:  (err: Error) => void) {
        this._db.run(query, callback);
    }

    get (query: string, callback?: (err: Error, row: any) => void) {
        this._db.get(query, callback);
    }

    all (query: string, callback?: (err: Error, rows: any[]) => void) {
        this._db.all(query, callback);
    }

    each (query: string, callback?: (err: Error, row: any) => void, complete?: (err: Error, count: number) => void) {
        this._db.each(query, callback, complete);
    }

    close (callback?: (err: Error) => void) {
        this._db.close(callback);
    }

    _joinWhere (wheres: any[]): string {
        return wheres.map((w) => {
            return Array.isArray(w) ? `(${w.join(' OR ')})` : w;
        }).join(' AND ');
    }
}

/**
 * DB接続
 * @var {string} filename: DBファイルの名前
 * @return {Sqliter}
 */
export function connect(filename: string): ISqliter {
    return new Sqliter(filename);
}
