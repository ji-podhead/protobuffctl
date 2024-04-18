// main.js
const { Worker } = require('worker_threads');
const {  getAll, remove, findAllUsages, add, del, protogenArr, pull, push, createFromConfig, get, toJson, create, addWatcher, removeWatcher, stopAllWatchers, startAllWatchers} = require('../src/shared.js');
//const cli = require("./util/cli.js")
const { Protobuffctl } = require("../src/protobuffctl.js");
const { time } = require('console');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };

class apiWrapper {
    constructor() {
        if (apiWrapper.instance) {
            console.log("middleware is allready running")
            console.log(apiWrapper.instance)
            return apiWrapper.instance;
        }
        console.log("starting middleware process")
        this.processStatus=true
        this.worker = new Worker('./worker.js');
        this.protobuffctl = new Protobuffctl()
        this.proccesStartTime=Date.now()
        this.serverStatus =new Promise(async(promise)=>{ 
        for(;;) {
         await delay(100);
         console.log(this.processStatus)
         if(this.processStatus==false) return resolve()
    
        }
    })
    this.worker.on('message', (message) => {
        console.log(`Main thread received message: ${message}`);
    });
    this.worker.postMessage('Hello, worker!');
}
getProcessStatus(){
    if(this.processStatus==false){
        console.log("process is not running")
        return false 
    }
    const formattedDate = this.proccesStartTime.toLocaleString('de-DE', options);
    console.log("protobuffctl process is running since " + formattedDate)
    return formattedDate
}
}
module.exports = {
    apiWrapper
}