var mongoose = require("mongoose");
var bcrypt = require("bcryptjs");
var userSchema = new mongoose.Schema({
    email: {
        unique:true,
        type:String
    },
    // 0:normal
    // 1:verified user
    // 2:professonal user
    // >10 admin
    // >50 super admin
    role:{
        type:Number,
        default:0
    },
    password:String
},{
    timestamps:true
})
userSchema.pre('save', function(next){
    if(this.isNew) {
        this.createdAt = this.updatedAt = Date.now()
    }else{
        this.updatedAt = Date.now()
    }
    var _password = this.password;
    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(_password, salt);
    this.password = hash;
    next()
})
userSchema.methods={
    comparePassword:function(_password,cb) {
        var password = this.password;
        bcrypt.compare(_password, password, function(err, isMatch) {
            if(err) return cb(err);
            return cb(null, isMatch)
        })
    }
}
var User = mongoose.model('User', userSchema)
module.exports = User