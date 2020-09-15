/**
 * 获取关于jsapi_ticket相关的方法
 */
const axios = require('axios');
const { _getJsapiTicket } = require('../config/url')
const { fetchAccessToken } = require('./access_token');
const { readFileAsync, writeFileAsync } = require('./read_write_file')

/**
 * 发请求获取jsapi_ticket
 */
async function getJsapiTicket() {
    try {
        // 先获取access_token值
        const access_token = await fetchAccessToken();
        //请求jsapi_ticket的URL
        const url = _getJsapiTicket(access_token.access_token);
        const result = await axios.get(url);
        return {
            ticket: result.ticket,
            expires_in: Date.now() + (result.expires_in - 300) * 1000
        }
    } catch (error) {
        return Promise.reject('getJsapiTicket方法出了问题：' + err);
    }
}

/**
 * 保存jsapi_ticket到本地文件
 * @param {*} ticket 获取的jsapi_ticket数据对象
 */
function saveJsapiTicket(ticket) {
    return writeFileAsync(ticket, 'ticket.txt');
}

/**
 * 读取本都的jsapi_ticket文件的数据 返回JSON对象
 */
function readJsapiTicket() {
    return readFileAsync('ticket.txt');
}

/**
 * 检测jsapi_ticket是否有效
 * @param {*} data 读取的本地jsapi_ticket文件数据
 */
function isValidJsapiTicket(data) {
    //检测传入的参数是否是有效的
    if (!data && !data.ticket && !data.expires_in) {
        //代表ticket无效的
        return false;
    }
    return data.expires_in > Date.now();
}

/**
 * 读取本地有效的jsapi_ticket数据
 */
async function fetchJsapiTicket() {
    try {
        //本地有文件
        const file = await readJsapiTicket();
        //判断它是否过期
        if (isValidJsapiTicket(file)) {
            //有效的
            return file
        } else {
            //过期了
            const result = await getJsapiTicket();
            await saveJsapiTicket(result);
            return result;
        }
    } catch (error) {
        //本地没有文件
        const result = await getJsapiTicket();
        await saveJsapiTicket(result);
        return result;
    }
}


module.exports = {
    fetchJsapiTicket,//只返回最终获取有效的获取jsapi_ticket值的方法
}
