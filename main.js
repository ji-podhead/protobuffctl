#!/usr/bin/env node
const {  getAll, remove, findAllUsages, add, del, protogenArr, pull, push, createFromConfig, get, toJson, create, addWatcher, removeWatcher, stopAllWatchers, startAllWatchers} = require('./src/shared.js');
const cli = require("./util/cli.js")

module.exports = {cli,   getAll, remove, findAllUsages, add, del, protogenArr, pull, push, createFromConfig, get, toJson, create, addWatcher, removeWatcher, stopAllWatchers, startAllWatchers};