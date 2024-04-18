#!/usr/bin/env node
const { apiWrapper } = require('./util/middleware.js');
const {  getAll, remove, findAllUsages, add, del, protogenArr, pull, push, createFromConfig, get, toJson, create, addWatcher, removeWatcher, stopAllWatchers, startAllWatchers} = require('./src/shared.js');
const wrapper = new apiWrapper()
//const cli = require("./util/cli.js")

module.exports = { getAll, remove, findAllUsages, add, del, protogenArr, pull, push, createFromConfig, get, toJson, create, addWatcher, removeWatcher, stopAllWatchers, startAllWatchers};


