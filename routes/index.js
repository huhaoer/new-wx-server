var express = require('express');
var router = express.Router();
const { TOKEN } = require('../config/constant');
const sha1 = require('sha1');
const { getUserDataAsync, parseXMLAsync, formatJsData, replyUserMessage, sendToUserXmlData } = require('../utils/user_message');//引入处理用户数据的方法

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
  /**
   * 用户向公众号发送消息时，还是会在验证权限的接口通过post请求发送信息
   * 此时可以在POST请求中得到用户发送的XML数据体
   * 然后根据数据的格式类型返回对应的消息回复或者是模板
   */
  //微信服务器提交的参数
  const { signature, echostr, timestamp, nonce } = req.query;//1.得到服务器参数
  const sha1Str = sha1([timestamp, nonce, TOKEN].sort().join(''));//2.字典排序 字符串 加密
  //微信服务器会将用户发送的数据以POST请求的方式转发到开发者服务器上
  //验证消息来自于微信服务器
  //=================================说明消息不是微信服务器=============================
  if (sha1Str !== signature) {
    res.send('Error! No Auth')
    return
  }

  // =============================消息来自服务器，接收到了用户的消息=========================
  //接受请求体中的数据，流式数据
  const xmlData = await getUserDataAsync(req);
  console.log(xmlData, 'xmlData====得到的用户XMLData数据');

  //将xml数据解析为js对象
  const jsData = await parseXMLAsync(xmlData);
  console.log(jsData, 'jsData===处理得到的用户jsData');

  //格式化数据
  const message = formatJsData(jsData);
  console.log(message, 'message===处理得到的用户信息');

  // 得到返回给用户的js配置对象，需要进一步转换为XML对象
  const options = await replyUserMessage(message);
  console.log(options, 'options===返回给用户的配置对象');

  //最终回复用户的消息
  const replyMessage = sendToUserXmlData(options);
  console.log(replyMessage);

  //返回响应给微信服务器
  res.send(replyMessage);
})

// 点击公众号菜单的电影选项，跳转的页面，进行接口编写
router.get('/movie', (req, res) => {
  res.send('我是电影接口测试')
})

module.exports = router;
