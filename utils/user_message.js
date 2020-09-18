/**
 * 用户向公众号发送信息，post请求
 * 导出处理用户信息和回复用户信息的方法
 */
const { parseString } = require('xml2js');//导入解析XML数据的包，解析为js对象

/**
 * 读取用户发送的信息数据 不能直接通过请求参数拿到，因为是流式数据，需要注册数据发送'data'和发送结束'end'事件
 * 返回的到的XML数据
 * @param {*} req 用户发送数据的post请求的请求头参数
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


module.exports = {
    getUserDataAsync,
    parseXMLAsync,
    formatJsData
}