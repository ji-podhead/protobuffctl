const { Protobuffctl } = require("../src/protobuffctl.js");
this.protobuffctl = new Protobuffctl()
const { getAll, get, create, toJson, stopAll, startAll, findAllUsages, del, pull, add, push, remove } = require("../src/shared");
const { set } = require('../../src/protoUtils');

const functions = {
    getAll: getAll,
    get: get,
    create: create,
    toJson: toJson,
    stopAll: stopAll,
    startAll: startAll,
    findAllUsages: findAllUsages,
    del: del,
    pull: pull,
    add: add,
    push: push,
    remove: remove,
    set: set

 }
 
process.on('message', (message) => {
    console.log(`Worker received message: ${message}`);
    const command = message["command"]
    const args=message["args"]
    const resp=functions[command](...args)
    console.log(resp)
    // Führen Sie hier Ihre asynchronen Operationen durch
    // Zum Beispiel:
    // someAsyncOperation().then(() => {
    //     process.postMessage('Operation completed');
    // });
});
