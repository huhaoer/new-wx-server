/*
  自定义菜单
 */
const { BASEURL } = require('../config/constant');

module.exports = {
  // "button": [
  //   {
  //     "type": "view",
  //     "name": "硅谷电影🎬",
  //     "url": `${BASEURL}/movie`
  //   },
  //   {
  //     "type": "view",
  //     "name": "语音识别🎤",
  //     "url": `${BASEURL}/search`
  //   },
  //   {
  //     "name": "戳我💋",
  //     "sub_button": [
  //       {
  //         "type": "view",
  //         "name": "官网☀",
  //         "url": "http://www.atguigu.com"
  //       },
  //       {
  //         "type": "click",
  //         "name": "帮助🙏",
  //         "key": "help"
  //       }
  //     ]
  //   }
  // ]

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
}