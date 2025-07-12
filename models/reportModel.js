const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
    {
        typeDetected: {
            type: String,
        },
        comments: {
            type: String,
            //required: true,
        },
        //slug: {
            //type: String,
            //lowercase: true,
        //},
        scannedImage: {
            type: String,
            required: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', 
            //required: [true, " The report must be belonging to a user"],
        },
        confidence: {
            type: Number,
        },
    },
    { timestamps: true}
);

module.exports = mongoose.model("report", reportSchema);