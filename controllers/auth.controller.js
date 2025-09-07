const { HandleServerError, HandleSuccess } = require('./Base.controller')
module.exports = {
    Login: async (req, res) => {
        try {
            HandleSuccess(res, "Hello", "Success")
        } catch (error) {
            HandleServerError(req, res, error)
        }
    }
}
