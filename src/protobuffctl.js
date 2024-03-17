
const chokidar = require('chokidar');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const serialize = require('serialize-javascript');
const { fork } = require('child_process');

const { ProtobuffGenerator } = require("protoc-helper")
const { classDescriptions } = require("../descriptions/classdescriptions");
const { time } = require('console');


class Filewatcher {
    constructor(protoFile) {
        this.proto = protoFile
        this.filePath = protoFile.path.path;
    }
    onFileChange(path) {
        console.log(`File ${path} has been changed`);
        console.log(__dirname)
        const dir = String(__dirname) + "/"
        const generator = new ProtobuffGenerator()
        generator.generateProtobuf("go", dir, "helloworld.proto", dir)
    }
    startWatcher() {
        return new Promise((resolve, reject) => {
            console.log('Starting file watcher...');
            this.watcher = chokidar.watch(this.filePath, {
                ignored: /(^|[\/\\])\../, // Ignorieren Sie versteckte Dateien
                persistent: true
            });
            this.watcher
                .on('add', path => this.onFileChange(path))
                .on('change', path => this.onFileChange(path))
                .on('unlink', path => console.log(`File ${path} has been removed`));
            resolve({
                stop: () => {
                    console.log('Stopping file watcher...');
                    this.watcher.close();
                }
            });
        });
    }
}
/**         ------------------ WatcherManager ---------------------    
 * @description ${classDescriptions.WatcherManager.description}
 */
class WatcherManager {
    constructor() {
        // @ts-ignore
        if (WatcherManager.instance) {
            return WatcherManager.instance;
        }

        this.watchers = new Map();
        WatcherManager.instance = this;
    }
    /**
     * @description Returns the singleton instance of the WatcherManager class.
     */
    static getInstance() {
        if (!WatcherManager.instance) {
            new WatcherManager();
        }
        return WatcherManager.instance;
    }
    /**
     * @description Initializes the watchers based on a configuration file.
     * @param {string} configPath - The path to the configuration file that contains the watcher settings.
     */
    async initialize(configPath) {
        try {
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            console.log('Configuration loaded successfully.');

            for (const protoFile of config.protoFiles) {
                await this.addWatcher(protoFile);
            }

            for (const protobuffFile of config.protobuffFiles) {
                await this.addWatcher(protobuffFile);
            }
            for (const component of config.components) {
                await this.addWatcher(component);
            }
            console.log('All watchers added.');
        } catch (error) {
            console.error('Error initializing:', error);
        }
    }
    /**
     * @description Adds a watcher for a given file or component.
     * @param {Object} protofile - The Proto file or component to be watched.
     */
    async addWatcher(protofile) {
        const filewatcher = new Filewatcher(protofile);
        await filewatcher.startWatcher();
        this.watchers.set(protofile, filewatcher);
        console.log(`Watcher added for ${protofile}`);
    }
    /**
     * @description Stops all active watchers.
     */
    stopAllWatchers() {
        for (const watcher of this.watchers.values()) {
            watcher.close();
        }
        console.log('All watchers stopped.');
    }
}

/**         ------------------ Registry ---------------------    
 * @description ${componentRegistryDocs.description}
 * @param {Object} params - An object containing all the parameters for the ComponentRegistry constructor.
 * @param {Map} params.fields - ${componentRegistryDocs.params.fields}  * @param {Map} params.services - ${componentRegistryDocs.params.services}  * @param {Map} params.methods - ${componentRegistryDocs.params.methods}  * @param {Map} params.types - ${componentRegistryDocs.params.types} * @param {Map} params.content - ${componentRegistryDocs.params.content} * @param {Map} params.message - ${componentRegistryDocs.params.message} * @param {Map} params.Enum - ${componentRegistryDocs.params.Enum} * @param {Map} params.EnumValues - ${componentRegistryDocs.params.EnumValues} * @param {Map} params.ProtoFilePaths - ${componentRegistryDocs.params.ProtoFilePaths} * @param {Map} params.Client - ${componentRegistryDocs.params.Client} * @param {Map} params.Request - ${componentRegistryDocs.params.Request} * @param {Map} params.Callback - ${componentRegistryDocs.params.Callback} * @param {Map} params.Stream - ${componentRegistryDocs.params.Stream} * @param {Map} params.ProtobuffFilePaths - ${componentRegistryDocs.params.ProtobuffFilePaths} * @param {Map} params.ProtobuffFile - ${componentRegistryDocs.params.ProtobuffFile} * @param {Map} params.ProtobuffUserPaths - ${componentRegistryDocs.params.ProtobuffUserPaths} * @param {Map} params.ProtobuffUser - ${componentRegistryDocs.params.ProtobuffUser} * @param {Map} params.ProtobuffUserComponentPreset - ${componentRegistryDocs.params.ProtobuffUserComponentPreset} * @param {Map} params.ProtobuffUserComponent - ${componentRegistryDocs.params.ProtobuffUserComponent} * @param {Map} params.EndpointPaths - ${componentRegistryDocs.params.EndpointPaths} * @param {Map} params.Endpoint - ${componentRegistryDocs.params.Endpoint} * @param {Map} params.MainEndpoint - ${componentRegistryDocs.params.MainEndpoint} */
class ComponentRegistry {
    constructor() {
        this.endPoints = new Map()
        // ProtoRegistry 
        this.fields = new Map();
        this.services = new Map();
        this.methods = new Map();
        this.types = new Map();
        this.enums = new Map();
        this.enumValues = new Map();
        this.protoFiles = new Map();
        this.protoFilePaths = new Map();
        // ProtoBuffRegistry 
        this.protobuffComponents = new Map();
        this.protobuffFiles = new Map();
        this.protobuffFilePaths = new Map();
        // ProtoUserRegistry {
        this.clients = new Map();
        this.methods = new Map();
        this.Streams = new Map();
        this.callbacks = new Map();
        this.protoUserComponents = new Map();
        this.protoUserFiles = new Map();
        this.protoUsers = new Map();

    }
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
/**         ------------------ Daemon ---------------------    
* @description ${classDescriptions.Daemon.description}
*/
class Daemon {
    constructor() {
        if (Daemon.instance) {
            return Daemon.instance;
        }
        Daemon.instance = this;
        this.daemonProcess = null;
        this.running = false;
    }

    async start() {
        if (!this.running) {

            this.running = true;
            console.log("_____________ STARTING DAEMON ")

            sleep(100000); // Wartet
            console.log("daemon killed")
        }
        else{
            console.log("_____________ DAEMON IS RUNNING ALREADY")
        }
    }


    stop() {
        if (this.running) {
            this.daemonProcess.kill();
            this.running = false;
            console.log("daemon killed")

        }
    }

    isRunning() {
        return this.running;
    }

    sendMessage(message) {
        if (this.running) {
            this.daemonProcess.send(message);
        } else {
            console.error('Daemon is not running.');
        }
    }
}



/**         ------------------ Protobuffctl ---------------------    
 * @description ${classDescriptions.Protobuffctl.description}
 */
class Protobuffctl {
    constructor() {
        if (Protobuffctl.instance) {
            return Protobuffctl.instance;
        }
        Protobuffctl.instance = this;
        this.MainEndpoint = "";
        this.generator = new ProtobuffGenerator()
        this.componentRegistry = new ComponentRegistry()
        this.watchpaths = []
        const filePath = path.join(__dirname, 'protobuffctl.txt');
        if (!fs.existsSync(filePath)) {
            this.save()
        }
        else {
            this.init()
        }
        this.daemon = new Daemon()//.start()
        this.watcherManager = new WatcherManager(); // WatcherManager wird als Teil von Protobuffctl definiert
       // this.startDaemon()
    }
    /**
     * @description ${classDescriptions.Protobuffctl.methods.startDaemon}
     */
    startDaemon() {
        this.daemon.start();
    }
    /**
     * @description ${classDescriptions.Protobuffctl.methods.stopDaemon}
     */
    stopDaemon() {
        this.daemon.stop();
    }
    /**
     * @description ${classDescriptions.Protobuffctl.methods.isDaemonRunning}
     */
    isDaemonRunning() {
        return this.daemon.isRunning();
    }
    init() {

        const filePath = path.join(__dirname, 'protobuffctl.txt');
        let readSerializedString = fs.readFileSync(filePath, 'utf8');
      //  console.log(readSerializedString);
        readSerializedString = eval('(' + readSerializedString + ')');
        Object.assign(this, readSerializedString);
      //  console.log(readSerializedString);
        //    const filePath2 = path.join(__dirname, 'protobuffctl.json');
        //   this.convertToJsonCompatible(filePath2)
    }
    save() {
        const serializedString = serialize(this);
        const filePath = path.join(__dirname, 'protobuffctl.txt');
        fs.writeFileSync(filePath, serializedString);
    }
    convertToJsonCompatible(filepath) {
        function flattenAndSerialize(obj) {
            if (obj instanceof Map) {
                // Wenn es sich um eine Map handelt, durchlaufen Sie alle Einträge
                let serializedMap = {};
                obj.forEach((value, key) => {
                    serializedMap[key] = flattenAndSerialize(value);
                });
                return serializedMap;
            } else if (typeof obj === 'object' && obj !== null) {
                // Wenn es sich um ein Objekt handelt, durchlaufen Sie alle Eigenschaften
                let serializedObj = {};
                Object.entries(obj).forEach(([key, value]) => {
                    serializedObj[key] = flattenAndSerialize(value);
                });
                return serializedObj;
            } else {
                // Wenn es sich um einen primitiven Wert handelt, geben Sie ihn einfach zurück
                return obj;
            }
        }
        let obj = flattenAndSerialize(this.componentRegistry)
        console.log(obj);
        obj = (JSON.stringify(obj))

        if (filepath != undefined) {
            fs.writeFileSync(filepath, obj);
            return obj;
        }
        console.log("____________________________________")
        console.log(obj)
    }
    convertFromJsonCompatible(obj, path) {
        if (Array.isArray(obj) && obj.every(item => 'key' in item && 'value' in item)) {
            // Konvertiere Array von Schlüssel-Wert-Paaren zurück in eine Map
            return new Map(obj.map(item => [item.key, item.value]));
        } else if (typeof obj === 'object' && obj !== null) {
            // Rekursiver Aufruf für alle Eigenschaften des Objekts
            return Object.fromEntries(
                Object.entries(obj).map(([key, value]) => [key, convertFromJsonCompatible(value)])
            );
        }
        return obj;
    }

}

class BuffUtils {
    constructor() {
        this.componentPreset = new Map();
    }
}

module.exports = { Protobuffctl }