require('dotenv').config();
const debugFFTVerbose = require('debug')('fft:verbose');
const debugFFTUltraVerbose = require('debug')('fft:ultraverbose');

const fft = require('fft-js').fft;
const fftUtil = require('fft-js').util;
const linear = require('everpolate').linear;
const mkdirp = require('mkdirp');

const MAX_FREQUENCY = 22000; // 22000 Hz

if (process.env.OUT_FOLDER_JSON) {
    mkdirp(process.env.OUT_FOLDER_JSON, function (err) {
        if (err) {
            throw new Error(err);
        }
    });
}

/**
 * FFT analysis on given samples
 * @param samples
 * @param options
 * @return {{magnitudes, frequencies}|{joined: Uint8Array | BigInt64Array | {magnitude: *, frequency: any}[] | Float64Array | Int8Array | Float32Array | Int32Array | Uint32Array | Uint8ClampedArray | BigUint64Array | Int16Array | Uint16Array, magnitudes, frequencies}}
 */
const analyzeSamples = (samples, options = {}) => {
    const phasors = fft(samples);

    const frequencies = fftUtil.fftFreq(phasors, 44100), // Sample rate and coef is just used for length, and frequency step
        magnitudes = fftUtil.fftMag(phasors);

    if (debugFFTVerbose.enabled) {
        const joined = frequencies.map(function (f, ix) {
            return {frequency: f, magnitude: magnitudes[ix]};
        });
        if (debugFFTUltraVerbose.enabled) {
            console.table(joined);
        }

    }
    return {frequencies, magnitudes}
};

exports.spectro = (samples) => {
    const C0 = 16.35;
    const NEXT_NOTE_MULTIPLIER = Math.pow(2, 1 / 12); // notes 16,25 = C0, C0 * 2^(1/12) = C# ...
    const {frequencies, magnitudes} = analyzeSamples(samples);
    let spectro = [];
    for (let i = C0; i <= MAX_FREQUENCY; i = i * NEXT_NOTE_MULTIPLIER) {
        spectro.push(i)
    }

    spectro = linear(spectro, frequencies, magnitudes);
    if (debugFFTVerbose.enabled) {
        console.table(spectro);
    }
    return spectro;
};
