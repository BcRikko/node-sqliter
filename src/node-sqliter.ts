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
    createTable (table: string, models: IModel[]): Promise<void>;

    save (table: string, field: any): Promise<void>;
    saveAll (table: string, fields: any[]): Promise<void>;

    find (table: string, wheres: any[]): Promise<any>;
    findAll (table: string, wheres: any[]): Promise<any[]>;

    update (table: string, fields: any, wheres?: any[]): Promise<void>;

    del (table: string, wheres?: any[]): Promise<void>;

    run (query: string): Promise<void>;
    get (query: string): Promise<any>;
    all (query: string): Promise<any[]>;
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

    createTable (table: string, models: IModel[]): Promise<void> {
        const params = models.map(model => {
            return [
                model.field,
                model.type,
                model.options
            ].join(' ');
        });

        const query = `CREATE TABLE IF NOT EXISTS ${table} ( ${params} )`;

        return new Promise<void>((resolve, reject) => {
            this._db.run(query, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }

            });
        });
    }

    save (table: string, field: any): Promise<void> {
        const keys = Object.keys(field);
        const values = keys.map((key) => { return `"${field[key]}"`; });

        const query = `INSERT INTO ${table} ( ${keys.join(',')} ) VALUES ( ${values.join(',')} )`;

        return new Promise<void>((resolve, reject) => {
            this._db.run(query, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    saveAll (table: string, fields: any[]): Promise<void> {
        const keys = Object.keys(fields[0]);
        const holder = keys.map(() => {return '?'; }).join(',');

        let statement = this._db.prepare(`INSERT INTO ${table} ( ${keys.join(',')} ) VALUES ( ${holder} )`);
        fields.forEach((model) => {
            const values = keys.map((key) => { return `${model[key]}`; });
            statement.run(values);
        });

        return new Promise<void>((resolve, reject) => {
            statement.finalize((err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    find (table: string, wheres: any[]): Promise<any> {
        const query = `SELECT * FROM ${table}` + this._joinWhere(wheres);;

        return new Promise((resolve, reject) => {
            this._db.get(query, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    findAll (table: string, wheres: any[]): Promise<any[]> {
        const query = `SELECT * FROM ${table}` + this._joinWhere(wheres);

        return new Promise((resolve, reject) => {
            this._db.all(query, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    update (table: string, fields: any, wheres?: any[]): Promise<void> {
        let param = [];
        for (let key in fields) {
            param.push(`${key} = "${fields[key]}"`);
        }

        const query = `UPDATE ${table} SET ${param.join(',')}` + this._joinWhere(wheres);

        return new Promise<void>((resolve, reject) => {
            this._db.run(query, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    del (table: string, wheres?: any[]): Promise<void> {
        const query = `DELETE FROM ${table}` + this._joinWhere(wheres);

        return new Promise<void>((resolve, reject) => {
            this._db.run(query, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    run (query: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this._db.run(query, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    get (query: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this._db.get(query, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    all (query: string): Promise<any[]> {
        return new Promise((resolve, reject) => {
            this._db.all(query, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    each (query: string, callback?: (err: Error, row: any) => void, complete?: (err: Error, count: number) => void) {
        this._db.each(query, callback, complete);
    }

    close (callback?: (err: Error) => void) {
        this._db.close(callback);
    }

    private _joinWhere (wheres: any[]): string {
        const condition = wheres && wheres.map((w) => {
            return Array.isArray(w) ? `(${w.join(' OR ')})` : w;
        }).join(' AND ');

        return condition ? ` WHERE ${condition}` : '';
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
