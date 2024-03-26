#!/usr/bin/env node
const { set } = require('./src/protoUtils.js');
const {  getAll, remove, findAllUsages, add, del, protogenArr, pull, push, createFromConfig, get, toJson, create, addWatcher, removeWatcher, stopAllWatchers, startAllWatchers} = require('./src/shared.js');
const cli = require("./util/cli.js")
set
module.exports = {cli,   getAll, remove, findAllUsages, add, del, protogenArr, pull, push, createFromConfig, get, toJson, create, addWatcher, removeWatcher, stopAllWatchers, startAllWatchers};