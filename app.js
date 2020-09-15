var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const { TOKEN } = require('./config/constant')
const sha1 = require('sha1')

app.get('/auth', (req, res) => {
    console.log(req.query, '????');
    /**
     *   signature: 'c9cb9b15802a0e3aecf4ffb7d65e608c230e6bc4',
        echostr: '6136597064511585534',
        timestamp: '1600177188',
        nonce: '1593833679'

     */
    const {
        signature,
        timestamp,
        nonce,
        echostr
    } = req.query; //解构微信服务器传递的数据
    const sortArray = [timestamp, nonce, TOKEN];
    sortArray.sort(); //字典排序
    const sortStr = sortArray.join(''); //转变为字符串
    const sha1Str = sha1(sortStr); //对排序的字符串进行sha1加密
    console.log(signature,sha1Str,signature === sha1Str);
    if (signature === sha1Str) {
        // 设置响应头 不然默认返回的时html
        res.set('Content-Type', 'text/plain')
        res.send(echostr)
    } else {
        res.send('Error! No Auth')
    }
})


module.exports = app;
