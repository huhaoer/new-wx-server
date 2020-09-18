/**
 * 用户向公众号发送信息，post请求
 * 导出处理用户信息和回复用户信息的方法
 */
const { parseString } = require('xml2js');//导入解析XML数据的包，解析为js对象
const mockData = require('../mock');//模拟的数据
const { BASEURL } = require('../config/constant')

/**
 * 读取用户发送的信息数据 不能直接通过请求参数拿到，因为是流式数据，需要注册数据发送'data'和发送结束'end'事件
 * 返回的到的XML数据
 * @param {*} req 用户发送数据的post请求的请求头参数
 * @returns <xml><ToUserName><![CDATA[gh_9468ad4bc5d0]]></ToUserName>
            <FromUserName><![CDATA[oQgo86Uz3GcwtyjvdJpezMLHRREQ]]></FromUserName>
            <CreateTime>1600428809</CreateTime>
            <MsgType><![CDATA[text]]></MsgType>
            <Content><![CDATA[1]]></Content>
            <MsgId>22912631064227555</MsgId>
            </xml> 
 */
function getUserDataAsync(req) {
    return new Promise((resolve, reject) => {
        let xmlData = '';
        req
            .on('data', data => {
                //当流式数据传递过来时，会触发当前事件，会将数据注入到回调函数中
                // console.log(data.toString());
                //读取的数据是buffer，需要将其转化成字符串
                xmlData += data.toString();
            })
            .on('end', () => {
                //当数据接受完毕时，会触发当前
                resolve(xmlData);
            })
    })
}

/**
 * 将用户发送得到的XML数据转换为js对象
 * @param {*} xmlData XML数据
 * @returns {
            xml: {
                ToUserName: [ 'gh_9468ad4bc5d0' ],
                FromUserName: [ 'oQgo86Uz3GcwtyjvdJpezMLHRREQ' ],
                CreateTime: [ '1600428809' ],
                MsgType: [ 'text' ],
                Content: [ '1' ],
                MsgId: [ '22912631064227555' ]
            }
        } 
 */
function parseXMLAsync(xmlData) {
    return new Promise((resolve, reject) => {
        parseString(xmlData, { trim: true }, (err, data) => {
            if (!err) {
                resolve(data);
            } else {
                reject('parseXMLAsync方法出了问题:' + err);
            }
        })
    })
}


/**
 * 将XML转为的js对象进行格式化，转变为需要的数据对象，并且可以方便操作
 * @param {*} jsData XML解析成的js对象
* @returns     {
                ToUserName: 'gh_9468ad4bc5d0', // 开发者的id(向开发者发送)
                FromUserName: 'oQgo86Uz3GcwtyjvdJpezMLHRREQ', //用户openid(谁发送的，用户)
                CreateTime: '1600428809',// 发送的时间戳
                MsgType: 'text', // 发送消息类型
                Content: '1', // 发送内容
                MsgId: '22912631064227555' // 消息id 微信服务器会默认保存3天用户发送的数据，通过此id三天内就能找到消息数据，三天后就被销毁
            }
 */
function formatJsData(jsData) {
    let message = {};
    //获取xml对象
    jsData = jsData.xml;
    //判断数据是否是一个对象
    if (typeof jsData === 'object') {
        //遍历对象
        for (let key in jsData) {
            //获取属性值
            let value = jsData[key];
            //过滤掉空的数据
            if (Array.isArray(value) && value.length > 0) {
                //将合法的数据复制到message对象上
                message[key] = value[0];
            }
        }

    }
    return message;
}


/**
 * 用于根据用户发送的数据，最终处理得到的message对象，然后解析判断，返回对应的数据给用户
 * @param {*} message XML => jsData => 处理后的jsData对象
 * @returns     {
                toUserName: 'oQgo86Uz3GcwtyjvdJpezMLHRREQ',//类似于这种 每一个不同类型的消息返回不同的配置对象
                fromUserName: 'gh_9468ad4bc5d0',
                createTime: 1600432192745,
                msgType: 'text',
                content: '欢迎您关注硅谷电影公众号~ \n' +
                    '回复 首页 查看硅谷电影预告片 \n' +
                    '回复 热门 查看最热门的电影 \n' +
                    '回复 文本 搜索电影信息 \n' +
                    '回复 语音 搜索电影信息 \n' +
                    '也可以点击下面菜单按钮，来了解硅谷电影公众号'
                }
 */
async function replyUserMessage(message) {
    // 填写发送时的配置对象
    let options = {
        toUserName: message.FromUserName,//向谁发送（填写用户的openid）
        fromUserName: message.ToUserName,//谁发送的(开发者id)
        createTime: Date.now(),//发送的时间戳
        msgType: 'text',//发送的消息类型
    }

    let content = '您在说什么，我听不懂？';
    //判断用户发送的消息是否是文本消息
    // ===============================================文本类型===========================================================
    if (message.MsgType === 'text') {
        //判断用户发送的消息内容具体是什么
        if (message.Content === '热门') {  //全匹配
            //回复用户热门消息数据
            // const data = await Theaters.find({}, { title: 1, summary: 1, posterKey: 1, doubanId: 1, _id: 0 });
            //将回复内容初始化为空数组
            content = [];
            options.msgType = 'news';//设置发送时配置对象类型为news 图文
            //通过遍历将数据添加进去
            for (let i = 0; i < mockData.length; i++) {
                let item = mockData[i];
                content.push({
                    title: item.title,
                    description: item.description,
                    picUrl: `http://peicjnx2h.bkt.clouddn.com/${item.posterKey}`
                })
            }

        } else if (message.Content === '首页') {
            options.msgType = 'news';
            content = [{
                title: '硅谷电影预告片首页',
                description: '这里有最新的电影预告片~',
                picUrl: 'http://www.atguigu.com/images/logo.jpg',
                url: `${BASEURL}/movie`
            }];
        } else {
            //用户发送的不是 '热门'或者'首页'
            content = '暂时没有相关的电影信息';
        }
    } else if (message.MsgType === 'voice') {
        // =======================================语音类型=====================================================
        console.log(message.Recognition);
        const voiceWorld = message.Recognition;//用户语音翻译的文字
        content = `您发送了语音信息:${voiceWorld}~`;
    } else if (message.MsgType === 'event') {
        // =======================================事件类型=====================================================
        if (message.Event === 'subscribe') {
            //用户订阅事件
            content = '欢迎您关注硅谷电影公众号~ \n' +
                '回复 首页 查看硅谷电影预告片 \n' +
                '回复 热门 查看最热门的电影 \n' +
                '回复 文本 搜索电影信息 \n' +
                '回复 语音 搜索电影信息 \n' +
                '也可以点击下面菜单按钮，来了解硅谷电影公众号';
        } else if (message.Event === 'unsubscribe') {
            //用户取消订阅事件
            console.log('无情取关~');
        } else if (message.Event === 'CLICK') {
            // 点击事件
            content = '您可以按照以下提示来进行操作~ \n' +
                '回复 首页 查看硅谷电影预告片 \n' +
                '回复 热门 查看最热门的电影 \n' +
                '回复 文本 搜索电影信息 \n' +
                '回复 语音 搜索电影信息 \n' +
                '也可以点击下面菜单按钮，来了解硅谷电影公众号'
        }
    }
    options.content = content;
    // 返回发送给用户的信息配置对象
    return options;
}


/**
 * 将得到的配置对象转变为微信服务器可以接收的XML数据，然后给用户显示
 * @param {*} options 得到的返回给用户的配置对象，需要转换为XML数据
 */
function sendToUserXmlData(options) {
    let replyMessage = `<xml>
        <ToUserName><![CDATA[${options.toUserName}]]></ToUserName>
        <FromUserName><![CDATA[${options.fromUserName}]]></FromUserName>
        <CreateTime>${options.createTime}</CreateTime>
        <MsgType><![CDATA[${options.msgType}]]></MsgType>`;

    if (options.msgType === 'text') {
        replyMessage += `<Content><![CDATA[${options.content}]]></Content>`;
    } else if (options.msgType === 'image') {
        replyMessage += `<Image><MediaId><![CDATA[${options.mediaId}]]></MediaId></Image>`;
    } else if (options.msgType === 'voice') {
        replyMessage += `<Voice><MediaId><![CDATA[${options.mediaId}]]></MediaId></Voice>`;
    } else if (options.msgType === 'video') {
        replyMessage += `<Video>
      <MediaId><![CDATA[${options.mediaId}]]></MediaId>
      <Title><![CDATA[${options.title}]]></Title>
      <Description><![CDATA[${options.description}]]></Description>
      </Video>`;
    } else if (options.msgType === 'music') {
        replyMessage += `<Music>
      <Title><![CDATA[${options.title}]]></Title>
      <Description><![CDATA[${options.description}]]></Description>
      <MusicUrl><![CDATA[${options.musicUrl}]]></MusicUrl>
      <HQMusicUrl><![CDATA[${options.hqMusicUrl}]]></HQMusicUrl>
      <ThumbMediaId><![CDATA[${options.mediaId}]]></ThumbMediaId>
      </Music>`;
    } else if (options.msgType === 'news') {
        replyMessage += `<ArticleCount>${options.content.length}</ArticleCount>
      <Articles>`;

        options.content.forEach(item => {
            replyMessage += `<item>
        <Title><![CDATA[${item.title}]]></Title>
        <Description><![CDATA[${item.description}]]></Description>
        <PicUrl><![CDATA[${item.picUrl}]]></PicUrl>
        </item>`
        })

        replyMessage += `</Articles>`;
    }

    replyMessage += '</xml>';
    //最终回复给用户的xml数据
    return replyMessage;
}

module.exports = {
    getUserDataAsync,
    parseXMLAsync,
    formatJsData,
    replyUserMessage,
    sendToUserXmlData
}