/**
 * Created by @xiusiteng on 2016-11-23.
 * @desc 电影相关-model
 */
import mongoose from "mongoose"
const MovieSchema = new mongoose.Schema({
    title : String,
    etitle: String,
    rating: {
        average: String,
        star   : Number
    },
    directors: [ {
        name: String
    } ],
    casts: [ {
        name: String
    } ],
    releasetime: Date,
    country    : [ {
        name: String
    } ],
    genres: [ {
        name: String
    } ],
    aka: [ {
        name: String
    } ],
    language: [ {
        name: String
    } ],
    actime: Number,
    images: {
        large : String,
        small : String,
        medium: String
    }
}, {
    timestamps: true
})
MovieSchema.pre("save", (next) => {
    if (this.isNew) {
        this.createdAt = this.updatedAt = Date.now()
    } else {
        this.updatedAt = Date.now()
    }
    next()
})
MovieSchema.statics = {
    fetch() {
        return this
            .find({})
            .sort({ updatedAt: -1 })
    },
    findById(id) {
        return this
            .findOne({ _id: id })
    }
}
const Movie = mongoose.model("movie", MovieSchema)
module.exports = Movie
