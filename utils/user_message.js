/**
 * 用户向公众号发送信息，post请求
 * 导出处理用户信息和回复用户信息的方法
 */
const { parseString } = require('xml2js');//导入解析XML数据的包，解析为js对象

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
                ToUserName: 'gh_9468ad4bc5d0',
                FromUserName: 'oQgo86Uz3GcwtyjvdJpezMLHRREQ',
                CreateTime: '1600428809',
                MsgType: 'text',
                Content: '1',
                MsgId: '22912631064227555'
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


async function replyUserMessage(message) {
    let options = {
        toUserName: message.FromUserName,
        fromUserName: message.ToUserName,
        createTime: Date.now(),
        msgType: 'text'
    }

    let content = '您在说什么，我听不懂？';
    //判断用户发送的消息是否是文本消息
    if (message.MsgType === 'text') {
        //判断用户发送的消息内容具体是什么
        if (message.Content === '热门') {  //全匹配
            //回复用户热门消息数据
            const data = await Theaters.find({}, { title: 1, summary: 1, posterKey: 1, doubanId: 1, _id: 0 });
            //将回复内容初始化为空数组
            content = [];
            options.msgType = 'news';
            //通过遍历将数据添加进去
            for (let i = 0; i < data.length; i++) {
                let item = data[i];
                content.push({
                    title: item.title,
                    description: item.summary,
                    picUrl: `http://peicjnx2h.bkt.clouddn.com/${item.posterKey}`,
                    url: `${url}/detail/${item.doubanId}`
                })
            }

        } else if (message.Content === '首页') {
            options.msgType = 'news';
            content = [{
                title: '硅谷电影预告片首页',
                description: '这里有最新的电影预告片~',
                picUrl: 'http://www.atguigu.com/images/logo.jpg',
                url: `${url}/movie`
            }];
        } else {
            //搜索用户输入指定电影信息
            //定义请求地址
            // const url = `https://api.douban.com/v2/movie/search?q=${message.Content}&count=8`;
            const url = 'https://api.douban.com/v2/movie/search';
            //发送请求
            // const {subjects} = rp({method: 'GET', url, json: true, qs: {q: message.Content, count: 8}});
            const data = await rp({ method: 'GET', url, json: true, qs: { q: message.Content, count: 8 } });
            const subjects = data.subjects;
            console.log(data);
            //判断subjects是否有值
            if (subjects && subjects.length) {
                //说明有数据,返回一个图文消息给用户
                //将回复内容初始化为空数组
                content = [];
                options.msgType = 'news';
                //通过遍历将数据添加进去
                for (let i = 0; i < subjects.length; i++) {
                    let item = subjects[i];
                    content.push({
                        title: item.title,
                        description: `电影评分为：${item.rating.average}`,
                        picUrl: item.images.small,
                        url: item.alt
                    })
                }
            } else {
                //说明没有数据
                content = '暂时没有相关的电影信息';
            }

        }
    } else if (message.MsgType === 'voice') {
        console.log(message.Recognition);
        //搜索用户输入指定电影信息
        //定义请求地址
        // const url = `https://api.douban.com/v2/movie/search?q=${message.Recognition}&count=8`;
        const url = 'https://api.douban.com/v2/movie/search';
        //发送请求
        const { subjects } = await rp({ method: 'GET', url, json: true, qs: { q: message.Recognition, count: 8 } });
        //判断subjects是否有值
        if (subjects && subjects.length) {
            //说明有数据,返回一个图文消息给用户
            //将回复内容初始化为空数组
            content = [];
            options.msgType = 'news';
            //通过遍历将数据添加进去
            for (let i = 0; i < subjects.length; i++) {
                let item = subjects[i];
                content.push({
                    title: item.title,
                    description: `电影评分为：${item.rating.average}`,
                    picUrl: item.images.small,
                    url: item.alt
                })
            }
        } else {
            //说明没有数据
            content = '暂时没有相关的电影信息';
        }
    } else if (message.MsgType === 'event') {
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
            content = '您可以按照以下提示来进行操作~ \n' +
                '回复 首页 查看硅谷电影预告片 \n' +
                '回复 热门 查看最热门的电影 \n' +
                '回复 文本 搜索电影信息 \n' +
                '回复 语音 搜索电影信息 \n' +
                '也可以点击下面菜单按钮，来了解硅谷电影公众号'
        }
    }

    options.content = content;

    return options;

}

module.exports = {
    getUserDataAsync,
    parseXMLAsync,
    formatJsData
}