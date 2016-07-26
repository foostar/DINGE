const Regexp = {
    email: /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/,
    password: /^[A-Za-z0-9]{8,22}$/,
    movieName:/^[A-Za-z0-9\u4E00-\u9FA5]{1,20}$/,
    username:/^[A-Za-z0-9\u4e00-\u9fa5]{1,9}$/
};
module.exports = Regexp;