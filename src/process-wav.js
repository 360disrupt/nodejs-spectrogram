require('dotenv').config();
const debugWav = require('debug')('wav');
const debugWavProcessing = require('debug')('wav:processing');
const debugWavVerbose = require('debug')('wav:verbose');

const fs = require('fs');
const async = require('async');
const sine = require('audio-oscillator/sin');
const WaveFile = require('wavefile');
const {unpackArray} = require('byte-data');

const analyze = require('./analyze');
const drawSpectogram = require('./draw-spectrogram');

const BYTE = 8;

const samplesLength = process.env.RESOLUTION || 1024; // must be dividable by 2: 2^10=1024, 44100 samples/s => ~1m, 16ms
let sampleRate = 44100; // wav 44100 sampleRate, 16bit

/**
 * Generate a sine wave
 */
const generateWav = () => {
    // generate sine wave 440 Hz
    const waveform = sine(samplesLength, 440); // samples, frequency
    return waveform
};

/**
 * Returns the number of sample sets at a sample size
 * @param wav
 * @return {number}
 */
const getNumberOfSamples = (wav) => {
    debugWav('getNumberOfSamples wav.data.samplsequenceses.length', wav.data.samples.length, 'samplesLength', samplesLength)
    return Math.floor(wav.data.samples.length / (samplesLength * (wav.dataType.bits / 8)));
};

/**
 * Return the sample at a given index. Extension of package wavefile. TODO: fix PR
 * @param {any} wav: the wave file
 * @param {number} startIndex The sample start index.
 * @param {number} stopIndex The sample stop index.
 * @return {number} The sample.
 * @throws {Error} If the sample index is off range.
 */
const getSamples = (wav, startIndex, stopIndex) => {
    startIndex = startIndex * (wav.dataType.bits / BYTE);
    stopIndex = stopIndex * (wav.dataType.bits / BYTE);
    if (stopIndex + wav.dataType.bits / BYTE > wav.data.samples.length) {
        const errMsg = `Range error, stopIndex ${stopIndex}, stopIndex + wav.dataType.bits ${stopIndex + wav.dataType.bits}, wav.data.samples.length ${wav.data.samples.length}`;
        throw new Error(errMsg);
    }
    return unpackArray(
        wav.data.samples.slice(startIndex, stopIndex),
        wav.dataType
    );
};

/**
 * Read a wav file from disk
 */
const readWav = (file, callback) => {
    let wav;
    // read the wav file
    const filePath = process.env.AUDIO_IN_FOLDER + '/' + file;
    debugWavProcessing('Processing', filePath);
    fs.readFile(filePath, (err, buffer) => {
        if (err) {
            return callback(err);
        }
        wav = new WaveFile(buffer);
        wav.toBitDepth("32f"); // convert to 32f for fft
        debugWavVerbose(wav);
        sampleRate = wav.fmt.sampleRate;
        return callback(null, file, wav)
    })
};

const processWav = (file, wav) => {
    let index = 0;
    const maxIndex = getNumberOfSamples(wav) - 1;
    debugWav(`Wav has ${maxIndex} sequences with ${samplesLength}`);
    const spectrograph = [];

    do {
        debugWavVerbose(`Seq ${index + 1}`);
        const samples = getSamples(wav, index * samplesLength, (index + 1) * samplesLength);
        index++;
        // console.table(samples)
        const snapshot = analyze.spectro(samples);
        spectrograph.push(snapshot);
    } while (index < maxIndex);

    const outPath = process.env.OUT_FOLDER_JSON + '/' + file.replace('.wav', '.json')
    if (process.env.SAVE) {
        debugWavProcessing(`Saving file to ${outPath}`);
        fs.writeFile(outPath, JSON.stringify(spectrograph, null, 4), console.log);
    }
    if (process.env.DRAW) {
        drawSpectogram.drawSpectrogram(file, spectrograph)
    }
};

/**
 * processes a generated wave e.g. sine wave
 */
exports.processGeneratedWav = () => {
    const samples = generateWav();
    analyze.spectro(samples);
};

/**
 * Reads all files in the audio-in folder and processes them
 * @param callback
 */
exports.processAudioInFolder = (callback) => {
    // Loop through all the files in the IN folder
    fs.readdir(process.env.AUDIO_IN_FOLDER, function (err, files) {
        if (err) {
            console.error(err);
            return callback("Could not list the directory.");
        }
        files = files.filter(file => file.match(/.*\.wav/));
        debugWavProcessing('Processing files', files);
        async.each(files, (file, next) => {
            async.waterfall([
                (next) => readWav(file, next),
                processWav
            ], next);
        }, callback);
    });
};

