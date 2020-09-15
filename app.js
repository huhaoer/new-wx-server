var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');

var app = express();
const { fetchAccessToken } = require('./utils/access_token')

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.get('/accesstoken', async (req, res) => {
    // 测试获取access_token
    try {
        const accessToken = await fetchAccessToken()
        res.send(accessToken)
    } catch (error) {
        res.send('获取access_token失败')
    }
})


module.exports = app;
