const processWav = require('./src/process-wav');

/**
 * Process the wav
 */
if (process.env.GENERATE === 'true') {
    processWav.processGeneratedWav();
} else {
    processWav.processAudioInFolder( (err) => {
        if (err) {
            throw new Error(err);
        } else {
            console.log("DONE")
        }
    });
}
