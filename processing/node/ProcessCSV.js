//region npm modules
var fs = require('fs');
var Converter = require("csvtojson").Converter;
var Promise = require('promise');
var numeral = require('numeral');
//endregion
//region modules

//endregion

/**
 @class ProcessCSV
 */
var ProcessCSV = function (loadFrom) {
    var _self = this;

    //region private fields and methods
    var _fieldSettings = {classificationSets: {}};
    var _colorSets = {};
    var _loadFrom = loadFrom;
    var _data = [];

    /** @type {Function} */
    var _validator = function (rowObj) {
        return true;
    };
    /** @type {Function} */
    var _transform = function (rowObj) {
        return rowObj;
    };

    var _init = function () {

    };

    var _allFields = function (fields, fn) {
        fields.forEach(function (fieldObj, i) {
            var fieldObj2 = JSON.parse(JSON.stringify(fieldObj));
            fieldObj2.field = fieldObj.field;
            if (!fieldObj2.shortName) fieldObj2.shortName = fieldObj2.field;
            fn(fieldObj2);
        });
    };
    var _getTypedVal = function (type, valStr) {
        if (type === 'DECIMAL') {
            return numeral().unformat(valStr);
        }
        if (type === 'INTEGER' || type.type === 'NUMERIC_RATING_W_CODES') {
            return Math.round(numeral().unformat(valStr));
        }
        return valStr;
    };

    var _loadCsvArrays = function (fileName, fn) {
        var fileStream = fs.createReadStream(fileName);
        var csvConverter = new Converter({constructResult: true, noheader:true});

        csvConverter.on("end_parsed", function (rows) {
            fn(rows.map((rowObj)=> {
                const arr = [];
            Object.keys(rowObj).forEach((k) => {
                arr.push(rowObj[k]);
        });
            return arr;
        }));
        });

        //read from file
        fileStream.pipe(csvConverter);
    };

    var _loadCsv = function (fileName, fn) {
        var fileStream = fs.createReadStream(fileName);
        var csvConverter = new Converter({constructResult: true});

        csvConverter.on("end_parsed", function (rows) {
            fn(rows);
        });

        //read from file
        fileStream.pipe(csvConverter);
    };

    var _processFields = function (fields, resolve, reject) {
        _fieldSettings.numberFields = [];
        fields.forEach(function (field, i) {
            if (field.type === 'INTEGER' || field.type === 'DECIMAL') {
                _fieldSettings.numberFields.push(field.shortName);
            }
        });

        _loadCsv(_loadFrom, function (rows) {
            _data = [];
            rows.forEach(function (row, i) {
                var rowObj = {};
                _allFields(fields, function (fieldObj) {
                    var field = fieldObj.field;
                    var valStr = row[field];
                    if (valStr) {
                        rowObj[fieldObj.shortName] = _getTypedVal(fieldObj.type, valStr);
                    }
                });
                rowObj = _transform(rowObj);

                if (!_validator(rowObj)) {
                    return;
                }

                _data.push(rowObj);
            });
            resolve(_self);
        });
    };

    var _processComplete = function (resolve, reject) {
        _loadCsv(_loadFrom, function (rows) {
            _data = [];
            rows.forEach(function (row, i) {
                var rowObj = _transform(row);
                if (!_validator(rowObj)) {
                    return;
                }
                _data.push(rowObj);
            });
            resolve(_self);
        });
    };

    //endregion

    //region public API
    this.processFields = function (fields) {
        return new Promise(function (resolve, reject) {
            _processFields(fields.fieldSets[0].fields, resolve, reject);
        });

    };

    this.processComplete = function (rawArrays) {
        if (!rawArrays) {
            return new Promise(function (resolve, reject) {
                _processComplete(resolve, reject);
            });
        } else {
            //equivalent to d3.csv.parseRows(raw);
            return new Promise(function (resolve, reject) {
                _loadCsvArrays(_loadFrom, function (rows) {
                    _data = rows;
                    resolve(_self);
                });
            });
        }

    };

    this.processLargeCSV = function (outputJSON) {
        var csvConverter = new Converter({
            constructResult: false,
            workerNum: 4
        });
        var readStream = require("fs").createReadStream(_loadFrom);
        var writeStream = require("fs").createWriteStream(outputJSON);
        readStream.pipe(csvConverter).pipe(writeStream);
    };

    /**
     * @param {Function} [validator]
     * @return {Function|ProcessCSV}
     */
    this.validator = function (validator) {
        if (!arguments.length) {
            return _validator;
        }
        _validator = validator;
        return _self;
    };

    /**
     * @param {Function} [transform]
     * @return {Function|ProcessCSV}
     */
    this.transform = function (transform) {
        if (!arguments.length) {
            return _transform;
        }
        _transform = transform;
        return _self;
    };

    this.saveJson = function (saveAs) {
        return new Promise(function (resolve, reject) {
            fs.writeFile(saveAs, JSON.stringify(_data, null, 2), function (err) {
                if (err) {
                    reject(err);
                } else {
                    console.log('Saved ' + saveAs);
                    resolve(saveAs);
                }
            });
        });
    };

    this.withData = function (fn) {
        fn(_data);
    };
    //endregion

    _init();
};

module.exports.ProcessCSV = ProcessCSV;

