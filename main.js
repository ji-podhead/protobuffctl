
const {  watcherManagerInstance, componentMap,init, save, deserialize, generateProtobuff,  createProtoComponent,addWatcher,removeWatcher, stopAll,startAll, createConfig} = require('./shared.js');
const cli = require("./cli")
const prototypes = ["nested", "double", "float", "int32", "int64", "uint32", "uint64", "sint32", "sint64", "fixed32", "fixed64", "sfixed32", "sfixed64", "bool", "string", "bytes"]

