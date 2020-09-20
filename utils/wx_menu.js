const axios = require('axios');
const { fetchAccessToken } = require('./access_token');
const { _getCreateMenu, _getDeleteMenu } = require('../config/url')


/**
 * 删除自定义菜单
 */
async function deleteMenu() {
    try {
        // 获取access_token
        const access_token = await fetchAccessToken();
        //定义请求地址
        const url = _getDeleteMenu(access_token.access_token);
        //发送请求
        const result = await axios.get(url);
        console.log(result,'删除菜单的结果');
        return result
    } catch (error) {
        return Promise.reject('deleteMenu方法出了问题：' + error);
    }
}

/**
 * 创建自定义菜单
 * @param {*} menuList 菜单数据
 */
async function createMenu(menuList) {
    try {
        // 获取access_token
        const access_token = await fetchAccessToken();
        //定义请求地址
        const url = _getCreateMenu(access_token.access_token);
        //发送请求
        const { data } = await axios.post(url, menuList);
        console.log(data, '创建菜单的结果');
        // return result
    } catch (error) {
        return Promise.reject('createMenu方法出了问题：' + error);
    }
}

module.exports = {
    deleteMenu,
    createMenu
}