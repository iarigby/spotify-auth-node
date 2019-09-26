const request = require('request'); // "request" library

const client_id = process.env.CLIENT_ID; // your client id
const client_secret = process.env.CLIENT_SECRET; // your secret

const fs = require('fs')

const fileName = 'data.json'

function readFile(callback) {
    fs.readFile(fileName, (err, data) => {
        if (err) throw err;
        callback(JSON.parse(data))
    })
}

function writeFile(data) {
    fs.writeFile(fileName, JSON.stringify(data), err => {
        if (err) console.log(err)
    })
}

exports.getAccessToken = function (callback) {
    readFile(data => {
        if (data.obtained_date + data.expires_in < (new Date()).getTime())
            callback(data.access_token)
        else
            refreshToken(callback)
    })
}

refreshToken = function (callback) {

    // requesting access token from refresh token
    // const refresh_token = req.query.refresh_token;
    readFile(data => {
        const authOptions = {
            url: 'https://accounts.spotify.com/api/token',
            headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
            form: {
                grant_type: 'refresh_token',
                refresh_token: data.refresh_token
            },
            json: true
        };

        request.post(authOptions, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                data.access_token = body.access_token;
                data.expires_in = body.expires_in;
                data.obtained_date = (new Date()).getTime()
                // refresh should be done automatically anyways, leaving just in case
                callback(data.access_token)
                writeFile(data)
            }
        });
    })
}
