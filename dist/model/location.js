"use strict";

var _mongoose = require("mongoose");

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const LocationSchema = new _mongoose2.default.Schema({
    x: String,
    y: String
}, {
    timestamps: true
});

const Location = _mongoose2.default.model("location", LocationSchema);

module.exports = Location;