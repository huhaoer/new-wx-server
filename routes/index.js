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

router.get('/accesstoken', async (req, res) => {
  // 测试获取access_token
  try {
    const accessToken = await fetchAccessToken()
    res.send(accessToken)
  } catch (error) {
    res.send('获取access_token失败')
  }
})

module.exports = router;
