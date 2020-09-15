const axios = require('axios');
const { _getAccessToken } = require('../config/url')
const { readFileAsync, writeFileAsync } = require('./read_write_file')


/**
 * 获取access_token
 */
async function getAccessToken() {
    //定义请求的地址
    const url = _getAccessToken();
    //发送请求
    try {
        const result = await axios.get(url);
        //设置access_token的过期时间
        result.expires_in = Date.now() + (result.expires_in - 300) * 1000;
        return result

    } catch (error) {
        //将promise对象状态改成失败的状态
        return Promise.reject('getAccessToken方法出了问题：' + error);
    }
}

/**
 * 保存access_token
 * @param {*} accessToken access_token 
 */
function saveAccessToken(accessToken) {
    return writeFileAsync(accessToken, 'access_token.txt');
}

/**
 * 读取access_token值
 */
function readAccessToken() {
    return readFileAsync('access_token.txt');
}

/**
 * 检测access_token是否有效(过期)
 * @param {*} data 读取的本地access_token文件
 */
function isValidAccessToken(data) {
    //检测传入的参数是否是有效的
    if (!data && !data.access_token && !data.expires_in) {
        //代表access_token无效的
        return false;
    }
    // 写入的过期时间和当前事件对比，判断是否过期
    return data.expires_in > Date.now();
}

/**
 * 获取没有过期的access_token
 */
async function fetchAccessToken() {
    try {
        //本地有文件
        const file = await readAccessToken();//首先读取本地的access_token文件
        //判断它是否过期
        if (isValidAccessToken(file)) {
            //有效的
            return file
        } else {
            //过期了
            //发送请求获取access_token(getAccessToken)，
            const result = await getAccessToken();
            //保存下来（本地文件）(saveAccessToken)
            await saveAccessToken(result);
            //将请求回来的access_token返回出去
            return result
        }

    } catch (error) {
        console.log(error,'fetchAccessToken接受的错误');
        //本地没有文件
        //发送请求获取access_token(getAccessToken)，
        const result = await getAccessToken();
        console.log(result,'错误后请求的accessToken');
        //保存下来（本地文件）(saveAccessToken)
        await saveAccessToken(result);
        //将请求回来的access_token返回出去
        return result
    }
}

module.exports = {
    fetchAccessToken,//只返回最终获取有效的获取access_token值的方法
}
