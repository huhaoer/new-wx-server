/*
  所有api地址接口
 */

const { APPID, APPSecret } = require('./constant')
//地址前缀
const prefix = 'https://api.weixin.qq.com/cgi-bin/';//微信服务器公共前缀

module.exports = {
    // https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${APPID}&secret=${AppSecret}
    //获取凭证access_token接口  GET
    _getAccessToken() {
        return `${prefix}token?grant_type=client_credential&appid=${APPID}&secret=${APPSecret}`
    },

    // https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${access_token}&type=jsapi  GET
    //获取JSPIA_Ticket票据
    _getJsapiTicket(access_token) {
        return `${prefix}ticket/getticket?access_token=${access_token}&type=jsapi`
    },

    // https://api.weixin.qq.com/cgi-bin/menu/create?access_token=ACCESS_TOKEN  POST
    //创建菜单
    _getCreateMenu(access_token) {
        return `${prefix}menu/create?access_token=${access_token}`
    },

    // http请求方式：GET https://api.weixin.qq.com/cgi-bin/menu/delete?access_token=ACCESS_TOKEN  GET
    //删除菜单
    _getDeleteMenu(access_token) {
        return `${prefix}menu/delete?access_token=${access_token}`
    }
}