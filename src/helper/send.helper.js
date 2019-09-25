const debugSend = require('debug')('helper:send');
const request = require('request');

exports.requestPost = (url, payload, callback) => {
    debugSend("Sending to", url);
    request.post(url).json(payload).on('response', (res) => {
        let responseData = "";
        // TODO: real err handling
        res.on('data', chunk => responseData += chunk);
        res.on('end', () => {
            // TODO: handle
            debugSend("GOT RESP");
            return callback(null);
        });
        res.on('err', (err) => {
            debugSend("Bad connection");
            return callback(err);
        });
    });
};

