#!/usr/bin/env node
const { apiWrapper } = require('./util/middleware.js');
const wrapper = new apiWrapper()
const cli = require("./util/cli.js")

module.exports = {cli,wrapper};


