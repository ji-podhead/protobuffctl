const { Command } = require('commander');
const {init, save, deserialize, generateProtobuff,  createProtoComponent,addWatcher,removeWatcher, stopAll,startAll, createConfig} =require("./shared")

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
    .command('createComponent  <filePath>')
    .description('save to your protobuffctl.json')
    .action(() => { save(filePath) });
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
