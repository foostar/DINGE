/**
 * Created by @xiusiteng on 2016-11-23.
 * @desc 用户相关-model
 */
import mongoose from "mongoose"
import bcrypt from "bcryptjs"
const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId
const userSchema = new mongoose.Schema({
    email: {
        unique: true,
        type  : String
    },
    // 0:normal
    // 1:verified user
    // 2:professonal user
    // >10 admin
    // >50 super admin
    sign: String,
    sex : {
        type   : String,
        default: "男"
    },
    city: {
        type   : String,
        default: "北京市,东城区"
    },
    birthday: {
        type   : Date,
        default: Date.now()
    },
    role: {
        type   : Number,
        default: 0
    },
    nickname: {
        unique : true,
        type   : String,
        default: `dinge${Date.now()}`
    },
    avatar: {
        type   : String,
        default: "/carouse/head.png"
    },
    lovedTo: [ {
        type: ObjectId,
        ref : "User"
    } ],
    lovedFrom: [ {
        type: ObjectId,
        ref : "User"
    } ],
    history: [ {
        type: ObjectId,
        ref : "comment"
    } ],
    star: [ {
        type: ObjectId,
        ref : "comment"
    } ],
    collet: [ {
        type: ObjectId,
        ref : "comment"
    } ],
    password: String
}, {
    timestamps: true
})
userSchema.pre("save", (next) => {
    if (this.isNew) {
        this.createdAt = this.updatedAt = Date.now()
    } else {
        this.updatedAt = Date.now()
    }
    let _password = this.password
    let salt = bcrypt.genSaltSync(10)
    let hash = bcrypt.hashSync(_password, salt)
    this.password = hash
    next()
})
userSchema.methods = {
    comparePassword(_password, cb) {
        const password = this.password
        bcrypt.compare(_password, password, (err, isMatch) => {
            if (err) {
                return cb(err)
            }
            return cb(null, isMatch)
        })
    }
}
const User = mongoose.model("User", userSchema)
module.exports = User
