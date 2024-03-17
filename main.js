
const { protobuffctl, init, save, deserialize, generateProtobuff,  createProtoComponent,addWatcher,removeWatcher, stopAll,startAll, createConfig} = require('./src/shared.js');
const cli = require("./util/cli.js")

module.exports = {cli,protobuffctl,init, save, deserialize, generateProtobuff,  createProtoComponent,addWatcher,removeWatcher, stopAll,startAll, createConfig};