/// <reference path="../typings/index.d.ts" />
"use strict"

import * as sqlite3 from "sqlite3";

export module TYPE {
    export const NONE = 'NONE';
    export const TEXT = 'TEXT';
    export const INTEGER = 'INTEGER';
    export const REAL = 'REAL';
    export const BLOB = 'BLOB';
}

export interface Model {
    field: string,
    type: string,
    options?: string
}



/**
 * Sqliter
 */
class Sqliter {
    private _db: sqlite3.Database;

    constructor(filename) {
        this._db = new sqlite3.Database(filename);
    }

    createTable (tableName: string, models: Model[], callback?: (err: Error) => void) {
        const params = models.map(model => {
            return [
                model.field,
                model.type,
                model.options
            ].join(' ');
        });

        const query = `CREATE TABLE IF NOT EXISTS ${tableName} ( ${params} )`;

        this._db.run(query, callback);
    }

    save (tableName: string, models: any, callback?: (err: Error) => void) {
        const keys = Object.keys(models);
        const values = keys.map((key) => { return `"${models[key]}"`; });

        const query = `INSERT INTO ${tableName} ( ${keys.join(',')} ) VALUES ( ${values.join(',')} )`;

        this._db.run(query, callback);
    }

    find (tableName: string, wheres: any, callback?: (err: Error, row: any) => void) {
        const query = `SELECT * FROM ${tableName} WHERE ${wheres.join(' ')}`;

        this._db.get(query, callback);
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
}

/**
 * DB接続
 * @var {string} filename: DBファイルの名前
 * @return {Sqliter}
 */
exports.connect = (filename: string): Sqliter => {
    return new Sqliter(filename);
};
