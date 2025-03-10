const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
    {
        date: {
            type: String, 
            required: true,
        },
        typeDetected: {
            type: String,
            required: true,
        },
        comments: {
            type: String,
            required: true,
        },
        slug: {
            type: String,
            lowercase: true,
        },
        scannedImage: {
            type: String,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', 
            required: [true, " The report must be belonging to a user"],
        },
    },
    { timestamps: true}
);

module.exports = mongoose.model("report", reportSchema);