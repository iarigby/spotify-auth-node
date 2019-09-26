const controller = require('./controller')
const api = require('./api')

exports.api.login = api.login
exports.api.callback = api.callback
exports.api.accessToken = api.accessToken

exports.getAccessToken = controller.getAccessToken