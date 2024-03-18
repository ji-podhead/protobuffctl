const { Command } = require('commander');
const {init, getAll,get, save, generateProtobuff,  set,createProto,addWatcher,removeWatcher, stopAll,startAll,  getProto} =require("../src/shared")



const cli = new Command();
cli
    // Ensure WatcherManager is instantiated before use
    .command('add <filePath>')
    .description('Add a watcher for the specified file path')
    .action(async (filePath) => { addWatcher(filePath); });
cli
    .command('remove <filePath>')
    .description('Remove the watcher for the specified file path')
    .action((filePath) => { removeWatcher(filePath) });
cli
    .command('startAll')
    .description('Start all watchers')
    .action(() => { startAll() });
cli
    .command('stopAll')
    .description('Stop all watchers')
    .action(() => { stopAll() });
cli
    .command('init')
    .description('initialize using your protobuffctl.json')
    .action(() => { init() });
cli
    .command('createProto <filePath>')
    .description('generate a Protofile Object from path to File')
    .action((filePath) => { 
        const parts = filePath.split('/');
         const path  = parts.slice(0, -1).join('/');
        const file = parts[parts.length - 1];
        createProto(file,path) });
cli
    .command('getProto <id><file><filePath>')
    .description('get a Protofile Object from the registry by path, or by id')
    .action((filePath) => { getProto(id,file,filePath) });
cli
    .command('createComponent  <filePath>')
    .description('save to your protobuffctl.json')
    .action(() => { save(filePath) });
cli
    .command('getAll  <type>')
    .description('save to your protobuffctl.json')
    .action((type) => { getAll(type) });
cli
    .command('set <type> <element_name> <values>')
    .description('save to your protobuffctl.json')
    .action((type,element_name, values) => { 
        set(type,element_name, values) });
cli
    .command('get <type> <name> <depth>')
    .description('save to your protobuffctl.json')
    .action((type,name,depth) => { 
        get(type,name,depth) });
cli
    .command('generateProtobuff  <language> <proto_path> <proto_file> <outputPath>')
    .description('generate a protobuff file. many languages supported')
    .action(() => { generateProtobuff(language, proto_path,proto_file, outputPath) });
cli
    .command('createProtoComponent <type> [args...]')
    .description('Create a ProtoComponent with the specified type and arguments')
    .action((type, args) => {
        // Convert args from an array to a list of arguments
        const componentArgs = args.split(',');
        createProtoComponent(type, ...componentArgs);
    });
cli
    .command('createConfig')
    .description('Erstellt eine Konfigurationsdatei, falls noch nicht vorhanden')
    .action(() => {createConfig(); });

       
cli.parse(process.argv);
module.exports = {  cli }
