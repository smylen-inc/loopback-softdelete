'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _util = require('util');

var _SoftDelete = require('./SoftDelete');

var _SoftDelete2 = _interopRequireDefault(_SoftDelete);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (0, _util.deprecate)(function (app) {
    app.loopback.modelBuilder.mixins.define('SoftDelete', _SoftDelete2.default);
}, 'DEPRECATED: Use mixinSources');


module.exports = exports.default;