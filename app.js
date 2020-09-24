var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');

var app = express();
const { fetchAccessToken } = require('./utils/access_token')
const { fetchJsapiTicket } = require('./utils/jsapi_ticket')
const { createMenu, deleteMenu } = require('./utils/wx_menu')
const menuList = require('./wechat/menu');//菜单配置

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//配置模板资源目录
app.set(path.join(__dirname, 'views'));
//配置模板引擎
app.set('view engine', 'ejs');


app.use('/', indexRouter);

(async () => {
    await deleteMenu();//删除菜单  创建之前先删除菜单
    await createMenu(menuList);//创建菜单 创建成功返回{ errcode: 0, errmsg: 'ok' }
})()

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

// app.get('/jsapiticket', async (req, res) => {
//     // 测试获取access_token
//     try {
//         const jsapi_ticket = await fetchJsapiTicket()
//         res.send(jsapi_ticket)
//     } catch (error) {
//         console.log(error, '获取jsapi_ticket的错误');
//         res.send('jsapi_ticket失败')
//     }
// })


module.exports = app;
