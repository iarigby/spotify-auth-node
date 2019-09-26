const controller = require('./controller')
const querystring = require('querystring');
const redirect_uri = process.env.REDIRECT_URI; // your redirect uri
const request = require('request'); // "request" library

const client_id = process.env.CLIENT_ID; // your client id
const client_secret = process.env.CLIENT_SECRET; // your secret

exports.login = function (req, res) {

    // your application requests authorization
    const scope = 'user-read-private user-read-email playlist-modify-public';
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
    controller.getAccessToken(data => {
        res.send({
            'access_token': data.access_token
        })
    })
}

