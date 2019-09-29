const request = require('request'); // "request" library

const client_id = process.env.CLIENT_ID; // your client id
const client_secret = process.env.CLIENT_SECRET; // your secret

const fileName = 'data.json'

const fs = require('fs')
const util = require('util')
const writeFile = util.promisify(fs.writeFile);
const readFile = util.promisify(fs.readFile)

const auth_opts = {
    last_refreshed: 0,
    current_value: {}
}
function getData() {
    // read every minute
    const time = new Date().getTime()
    if (time - auth_opts.last_refreshed < 3600) {
        const data = auth_opts.current_value
        return new Promise((resolve, reject) => {
            resolve(data)
        })
    }
    return readFile(fileName)
        .then(data => JSON.parse(data))
        .then(data => {
            auth_opts.last_refreshed = time
            auth_opts.current_value = data
            return data
        })
        
}

function setData(data) {
    auth_opts.last_refreshed = new Date().getTime()
    auth_opts.current_value = data
    return writeFile(fileName, JSON.stringify(data))
        .catch(error => console.log(error))
}

exports.setData = setData

exports.getAccessToken = function () {
    return getData()
        .then(data => {
            if (data.obtained_date + data.expires_in < (new Date()).getTime())
                return refreshToken()
            else
                if (data.access_token)
                    return data.access_token
                else
                    throw "could not read access token"
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
                data.expires_in = body.expires_in*1000;
                data.obtained_date = (new Date()).getTime()
                // refresh should be done automatically anyways, leaving just in case
                setData(data)
                return data.access_token
            }
            if (error)
                throw 'couldnt refresh token: ' + error
        });
    })
}
    