const mongoose = require("mongoose");

const muteTemplate = mongoose.Schema({
        // main things
        Guild_Name: String,
        Guild_ID: String,
        User: String,
        UserID: String,
        Error: String,
        Time: String,
        Command: String,
        Args: Array,
    })

module.exports = mongoose.model("Errors",muteTemplate);