var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');

var app = express();
const { fetchAccessToken } = require('./utils/access_token')
const { fetchJsapiTicket } = require('./utils/jsapi_ticket')
const { createMenu, deleteMenu } = require('./utils/wx_menu')
const menu = require('./wechat/menu')

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



// 删除菜单
// deleteMenu();
// // // 创建菜单
// createMenu(menu);

app.post('/menu', async (req, res) => {
    const result = await axios.post('https://api.weixin.qq.com/cgi-bin/menu/create?access_token=37_5H3rlkMTQaFfiYdMkXYqO-CdjEPasJDo31kvRqu2OAhq7W2UsnazUc02zH58qqfe4oQ4jPAykQn_JQ8vyYqY9s1iugIi5_Xt064a8VutscPliJ6s7wZyO5t2o72jx-Pdjd9kKo18_E3tuEooABQdAGAVWL',menu)
    res.send(result)
})

module.exports = app;
