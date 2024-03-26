
const { set } = require('./src/protoUtils.js');
const { protobuffctl,  get,generateProtobuff, createProto, addWatcher,removeWatcher, stopAll,startAll} = require('./src/shared.js');
const cli = require("./util/cli.js")
set
module.exports = {cli,protobuffctl,  generateProtobuff,  addWatcher,removeWatcher, stopAll,startAll};