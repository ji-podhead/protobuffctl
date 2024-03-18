
const { protobuffctl, init, save,get,generateProtobuff, createProto, createProtoComponent,addWatcher,removeWatcher, stopAll,startAll} = require('./src/shared.js');
const cli = require("./util/cli.js")

module.exports = {cli,protobuffctl,init, save, generateProtobuff,  createProtoComponent,addWatcher,removeWatcher, stopAll,startAll};