const Regexp = {
    email: /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/,
    password: /^[A-Za-z0-9]{8,22}$/,
    movieName:/^[A-Za-z0-9\u4E00-\u9FA5]{1,20}$/
}
module.exports = Regexp