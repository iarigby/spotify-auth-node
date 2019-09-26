const controller = require('./controller')
const api = require('./api')

exports.api_login = api.login
exports.api_callback = api.callback
exports.api_accessToken = api.accessToken

exports.getAccessToken = controller.getAccessToken