'strict'
const request = require('request');

const notifyLine = function (message, note){

        request({
            method: 'POST',
            uri: 'https://notify-api.line.me/api/notify',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            auth: {
                'bearer': process.env.LINETOKEN
            },
            form: {
                message: message+'\n'+note
            }
        }, (err, httpResponse, body) => {
            if (err) {
                console.log(err);
            } else {

            }
        });       
}

module.exports = {
	notifyLine
}
