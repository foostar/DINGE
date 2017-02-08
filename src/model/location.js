import mongoose from "mongoose"
const LocationSchema = new mongoose.Schema({
    x: String,
    y: String
}, {
    timestamps: true
})

const Location = mongoose.model("location", LocationSchema)

module.exports = Location
