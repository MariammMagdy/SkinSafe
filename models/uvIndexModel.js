const mongoose = require('mongoose');

const uvIndexSchema = new mongoose.Schema(
    {
        locationName: {
            type: String,
            required: true
        },
        lat: {
            type: Number,
            required: true
        },
        lon: {
            type: Number,
            required: true
        },
        uvValue: {
            type: Number,
            required: true
        },
        riskLevel: {
            type: String,
            enum: ['Low', 'Moderate', 'High', 'Very High', 'Extreme'],
            required: true
        },
    },
    {
        timestamps: true,
    }
);

module.exports= mongoose.model("UVIndex", uvIndexSchema);


