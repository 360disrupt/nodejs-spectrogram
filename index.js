const processWav = require('./src/process-wav');

/**
 * Process the wav
 */
if (process.env.GENERATE === 'true') {
    processWav.processGeneratedWav();
} else if (process.env.WATCH) {
    processWav.watchAudioInFolder();
} else {
    processWav.processAudioInFolder((err) => {
        if (err) {
            throw new Error(err);
        } else {
            console.log("DONE")
        }
    });
}
