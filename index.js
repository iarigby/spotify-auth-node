const request = require('request'); // "request" library
const querystring = require('querystring');

const client_id = process.env.CLIENT_ID; // your client id
const client_secret = process.env.CLIENT_SECRET; // your secret
const redirect_uri = process.env.REDIRECT_URI; // your redirect uri
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
exports.login = function (req, res) {

    // your application requests authorization
    const scope = 'user-read-private user-read-email';
    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: client_id,
            scope: scope,
            redirect_uri: redirect_uri
        }));
}

exports.callback = function (req, res) {
    const code = req.query.code || null;

    const authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
            code: code,
            redirect_uri: redirect_uri,
            grant_type: 'authorization_code'
        },
        headers: {
            'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
        },
        json: true
    };

    request.post(authOptions, function (error, response, body) {
        if (!error && response.statusCode === 200) {

            const data = {
                access_token: body.access_token,
                refresh_token: body.refresh_token,
                expires_in: body.expires_in,
                obtained_date: (new Date()).getTime()
            }
            writeFile(data)
            /*
            const options = {
                url: 'https://api.spotify.com/v1/me',
                headers: { 'Authorization': 'Bearer ' + access_token },
                json: true
            };

            // use the access token to access the Spotify Web API
            request.get(options, function (error, response, body) {
                console.log(body);
            });
            */
            // we can also pass the token to the browser to make requests from there
            res.redirect('/#' +
                querystring.stringify({
                    access_token: data.access_token,
                    refresh_token: data.refresh_token
                }));
        } else {
            res.redirect('/#' +
                querystring.stringify({
                    error: 'invalid_token'
                }));
        }
    })
}

exports.accessToken = function (req, res) {
    readFile(data => {
        if (data.obtained_date + data.expires_in > (new Date()).getTime())
            refreshToken(req, res)
        else
            res.send({
                'access_token': data.access_token
            })
    })
}
exports.refreshToken = function (req, res) {

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
                res.send({
                    'access_token': data.access_token
                });
                writeFile(data)
            }
        });
    })
}