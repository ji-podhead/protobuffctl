// worker.js
process.on('message', (message) => {
    console.log(`Worker received message: ${message}`);
    // Führen Sie hier Ihre asynchronen Operationen durch
    // Zum Beispiel:
    // someAsyncOperation().then(() => {
    //     process.postMessage('Operation completed');
    // });
});