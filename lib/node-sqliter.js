/// <reference path="../typings/index.d.ts" />
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.TYPE = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _sqlite = require("sqlite3");

var sqlite3 = _interopRequireWildcard(_sqlite);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TYPE = exports.TYPE = undefined;
(function (TYPE) {
    TYPE.NONE = 'NONE';
    TYPE.TEXT = 'TEXT';
    TYPE.INTEGER = 'INTEGER';
    TYPE.REAL = 'REAL';
    TYPE.BLOB = 'BLOB';
})(TYPE || (exports.TYPE = TYPE = {}));
/**
 * Sqliter
 */

var Sqliter = function () {
    function Sqliter(filename) {
        _classCallCheck(this, Sqliter);

        this._db = new sqlite3.Database(filename);
    }

    _createClass(Sqliter, [{
        key: "createTable",
        value: function createTable(tableName, models, callback) {
            var params = models.map(function (model) {
                return [model.field, model.type, model.options].join(' ');
            });
            var query = "CREATE TABLE IF NOT EXISTS " + tableName + " ( " + params + " )";
            this._db.run(query, callback);
        }
    }, {
        key: "save",
        value: function save(tableName, models, callback) {
            var keys = Object.keys(models);
            var values = keys.map(function (key) {
                return "\"" + models[key] + "\"";
            });
            var query = "INSERT INTO " + tableName + " ( " + keys.join(',') + " ) VALUES ( " + values.join(',') + " )";
            this._db.run(query, callback);
        }
    }, {
        key: "find",
        value: function find(tableName, wheres, callback) {
            var query = "SELECT * FROM " + tableName + " WHERE " + wheres.join(' ');
            this._db.get(query, callback);
        }
    }]);

    return Sqliter;
}();
/**
 * DB接続
 * @var {string} filename: DBファイルの名前
 * @return {Sqliter}
 */


exports.connect = function (filename) {
    return new Sqliter(filename);
};
//# sourceMappingURL=node-sqliter.js.map
