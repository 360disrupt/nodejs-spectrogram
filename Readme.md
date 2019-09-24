# About
This tool transforms wav files into spectrograms. Either as a PNG or as a json for further use in tensorflow.

![Example Spectrogram](./docs/reference.png)

# How to use:
1. `git clone https://github.com/360disrupt/nodejs-spectrogram.git && cd nodejs-spectrogram`
2. Rename `.env.example`, change the default config to your demands and put the audio files to convert into the `AUDIO_IN` folder.
3. `npm run dev` (Maybe adjust ram settings in the package.json)

You need to follow the instructions of the package [`canvas`](https://github.com/Automattic/node-canvas) to draw spectrograms.

# Envs

- AUDIO_IN_FOLDER: {string} the folder to look for audio files
- WATCH: {boolean}, watch the audio in folder for new files
- OUT_FOLDER_JSON: {string} the folder for the json spectrogram
- OUT_FOLDER_DRAW: {string} the folder for the png spectrogram
- GENERATE: {boolean}, use a dummy sine wav (for testing purposes)
- DRAW: {boolean} create a png
- RESOLUTION: {number, root of 2} how many samples are in one sequence
- CROP: {boolean} crop files to the smallest file to have the same sequence length
- CROP_MAX: {number} crop files to a max of sequences
- DEBUG: {string} show debug logs

# Misc 
Let me know if you need this as an NPM package. I can convert it and make the process envs to an options object.
  
## Useful resources

About fft/spectrometer in python
https://www.oreilly.com/library/view/elegant-scipy/9781491922927/ch04.html

Digital signal processing
https://dsp.stackexchange.com/

# License
MIT, see license file
