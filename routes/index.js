var express = require('express');
var router = express.Router();
const { TOKEN } = require('../config/constant')
const sha1 = require('sha1')
const { fetchAccessToken } = require('../utils/access_token')

// 验证服务器权限 GET 微信服务器向layoung.club/auth发送请求携带参数
router.get('/auth', (req, res) => {
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
  if (signature === sha1Str) {
    // 设置响应头 不然默认返回的时html
    res.set('Content-Type', 'text/plain')
    res.send(echostr)
  } else {
    res.send('Error! No Auth')
  }
})

// 接收用户从公众号发送的XML数据 POST 根据用户发送的消息决定返回什么类型模式的模板消息
router.post('/auth', async (req, res) => {
  console.log(req.query,'post请求接收到的微信服务器验证');
  //微信服务器会将用户发送的数据以POST请求的方式转发到开发者服务器上
  //验证消息来自于微信服务器
  // if (sha1Str !== signature) {
  //   //说明消息不是微信服务器
  //   res.end('error');
  // }

  //接受请求体中的数据，流式数据
  // const xmlData = await getUserDataAsync(req);

  // //将xml数据解析为js对象
  // const jsData = await parseXMLAsync(xmlData);

  // //格式化数据
  // const message = formatMessage(jsData);
  // console.log(message);
  // const options = await reply(message);
  // console.log(options);
  // //最终回复用户的消息
  // const replyMessage = template(options);
  // console.log(replyMessage);

  // //返回响应给微信服务器
  // res.send(replyMessage);
})

module.exports = router;
