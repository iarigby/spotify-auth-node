const request = require('request'); // "request" library

const client_id = process.env.CLIENT_ID; // your client id
const client_secret = process.env.CLIENT_SECRET; // your secret


const fileName = 'data.json'

const fs = require('fs')
const util = require('util')
const writeFile = util.promisify(fs.writeFile);
const readFile = util.promisify(fs.readFile)

function getData() {
    return readFile(fileName)
        .then(data => JSON.parse(data))
}

exports.setData = function(data) {
    return writeFile(fileName, JSON.stringify(data))
        .catch(error => console.log(error))
}

exports.getAccessToken = function () {
    return getData()
        .then(data => {
            if (data.obtained_date + data.expires_in < (new Date()).getTime())
                return data.access_token
            else
                return refreshToken()
        })
}

refreshToken = function () {

    // requesting access token from refresh token
    // const refresh_token = req.query.refresh_token;
    return getData().then(data => {
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
                setData(data)
                return data.access_token
            }
        });
    })
}
