const { HandleSuccess, HandleServerError } = require("./Base.controller")

module.exports = {
    sendVideo: async (req, res) => {
        try {
            HandleSuccess(res, "Video endpoint", "Success")
        } catch (error) {
            HandleServerError(req, res, error)
        }
    }
}