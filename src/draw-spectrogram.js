require('dotenv').config();
const debugWavProcessing = require('debug')('wav:processing');
const debugSpectro = require('debug')('spectro');

const fs = require('fs');
const {createCanvas} = require('canvas');
const mkdirp = require('mkdirp');

if (process.env.OUT_FOLDER_DRAW) {
    mkdirp(process.env.OUT_FOLDER_DRAW, function (err) {
        if (err) {
            throw new Error(err);
        }
    });
}

/**
 * Draws a spectrogram
 * @param fileName
 * @param spectrograph: in array form
 */
exports.drawSpectrogram = (fileName, spectrograph) => {
    debugWavProcessing('drawing canvas')
    const strokeHeight = 1;
    const canvasHeight = spectrograph[0].length * strokeHeight;
    const canvasWidth = spectrograph.length;
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');
    // init canvas
    ctx.fillStyle = 'hsl(280, 100%, 10%)';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    spectrograph.forEach((sequence, timeSeq) => {
        sequence.forEach((value, frequency) => {
            let rat = value / 255; // TODO: chck in/max
            let hue = Math.round((rat * 120) + 280 % 360);
            let sat = '100%';
            let lit = 10 + (70 * rat) + '%';

            ctx.beginPath();
            ctx.strokeStyle = `hsl(${hue}, ${sat}, ${lit})`;
            debugSpectro("frequency", frequency, "value", value)
            ctx.moveTo(timeSeq, canvasHeight - (frequency * strokeHeight));
            ctx.lineTo(timeSeq, canvasHeight - (frequency * strokeHeight + strokeHeight));
            ctx.stroke();
        });
    });
    const outPath = process.env.OUT_FOLDER_DRAW + '/' + fileName.replace('.wav', '.png')
    debugWavProcessing(`Drawing spectro to to ${outPath}`);
    const out = fs.createWriteStream(outPath);
    const stream = canvas.createPNGStream();
    stream.pipe(out);
    out.on('finish', () => console.log('The PNG file was created.'));
};
