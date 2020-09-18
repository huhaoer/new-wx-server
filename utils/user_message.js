/**
 * 用户向公众号发送信息，post请求
 * 导出处理用户信息和回复用户信息的方法
 */

/**
 * 读取用户发送的信息数据 不能直接通过请求参数拿到，因为是流式数据，需要注册数据发送'data'和发送结束'end'事件
 * @param {*} req 用户发送数据的post请求的请求头参数
 */
async function getUserDataAsync(req) {
    return new Promise((resolve, reject) => {
        let xmlData = '';
        req
            .on('data', data => {
                console.log(data,'data=========');
                //当流式数据传递过来时，会触发当前事件，会将数据注入到回调函数中
                // console.log(data.toString());
                //读取的数据是buffer，需要将其转化成字符串
                xmlData += data.toString();
                console.log(xmlData,'xmlData?????');
            })
            .on('end', () => {
                //当数据接受完毕时，会触发当前
                resolve(xmlData);
            })
    })
}

module.exports = {
    getUserDataAsync
}