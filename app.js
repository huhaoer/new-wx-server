var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');

var app = express();
const { fetchAccessToken } = require('./utils/access_token')
const { fetchJsapiTicket } = require('./utils/jsapi_ticket')
const { createMenu, deleteMenu } = require('./utils/wx_menu')

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
        console.log(error, '获取access_token的错误');
        res.send('获取access_token失败')
    }
})

app.get('/jsapiticket', async (req, res) => {
    // 测试获取access_token
    try {
        const jsapi_ticket = await fetchJsapiTicket()
        res.send(jsapi_ticket)
    } catch (error) {
        console.log(error, '获取jsapi_ticket的错误');
        res.send('jsapi_ticket失败')
    }
})

createMenu({
    "button": [
        {
            "type": "click",
            "name": "今日歌曲",
            "key": "V1001_TODAY_MUSIC"
        },
        {
            "name": "菜单",
            "sub_button": [
                {
                    "type": "view",
                    "name": "搜索",
                    "url": "http://www.soso.com/"
                },
                {
                    "type": "miniprogram",
                    "name": "wxa",
                    "url": "http://mp.weixin.qq.com",
                    "appid": "wx286b93c14bbf93aa",
                    "pagepath": "pages/lunar/index"
                },
                {
                    "type": "click",
                    "name": "赞一下我们",
                    "key": "V1001_GOOD"
                }]
        }]
})

module.exports = app;
