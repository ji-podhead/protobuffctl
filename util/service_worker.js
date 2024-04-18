const { Protobuffctl } = require("../src/protobuffctl.js");
this.protobuffctl = new Protobuffctl()
const { getAll, get, create, toJson, stopAll, startAll, findAllUsages, del, pull, add, push, remove } = require("../../src/shared");
const { set } = require('../../src/protoUtils');
process.on('message', (message) => {
    console.log(`Worker received message: ${message}`);
    // Führen Sie hier Ihre asynchronen Operationen durch
    // Zum Beispiel:
    // someAsyncOperation().then(() => {
    //     process.postMessage('Operation completed');
    // });
});