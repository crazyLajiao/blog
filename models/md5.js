let crypto = require('crypto')
module.exports = function(pw) {
    let md5 = crypto.createHash('md5')
    let password = md5.update(pw).digest('base64')
    return password
}