var mongoose = require("mongoose");
var bcrypt = require("bcryptjs");
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
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
    sign:String,
    sex:{
        type:String,
        default:"男"
    },
    city:{
        type:String,
        default:"北京市,东城区"
    },
    birthday:{
        type:Date,
        default:Date.now()
    },
    role:{
        type:Number,
        default:0
    },
    nickname:{
        unique:true,
        type:String,
        default:"dinge"+Date.now()
    },
    avatar:{
        type:String,
        default:"/carouse/head.png"
    },
    lovedTo:[ {
        type:ObjectId, ref:"User"
    } ],
    lovedFrom:[ {
        type:ObjectId, ref:"User"
    } ],
    history:[ {
        type:ObjectId, ref:"comment" 
    } ],
    star:[ {
        type:ObjectId, ref:"comment" 
    } ],
    collet:[ {
        type:ObjectId, ref:"comment" 
    } ],
    password:String
},{
    timestamps:true
});
userSchema.pre("save", function(next){
    if(this.isNew) {
        this.createdAt = this.updatedAt = Date.now();
    }else{
        this.updatedAt = Date.now();
    }
    var _password = this.password;
    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(_password, salt);
    this.password = hash;
    next();
});
userSchema.methods={
    comparePassword:function(_password,cb) {
        var password = this.password;
        bcrypt.compare(_password, password, function(err, isMatch) {
            if(err) {
                return cb(err);
            }
            return cb(null, isMatch);
        });
    }
};
var User = mongoose.model("User", userSchema);
module.exports = User;