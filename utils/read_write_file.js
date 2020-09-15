/**
 * 关于文件保存和读取的党法
 */

const { writeFile, readFile } = require('fs');//引入fs模块
const path = require('path');

/**
 * 写入文件，可以保存access_token或者是jsapi_ticket
 * @param {*} data 当前文件数据
 * @param {*} fileName 保存的文件名
 */
function writeFileAsync(data, fileName) {
    console.log(data, fileName, '写入文件时传入的数据');
    //将对象转化json字符串
    let file = JSON.stringify(data);
    const filePath = path.resolve(__dirname, fileName);
    return new Promise((resolve, reject) => {
        writeFile(filePath, file, err => {
            if (!err) {
                resolve();
            } else {
                reject('writeFileAsync方法出了问题：' + err);
            }
        })
    })
}

/**
 * 读取文件access_token或者是jsapi_ticket
 * @param {*} fileName 当前文件名
 */
function readFileAsync(fileName) {
    const filePath = path.resolve(__dirname, fileName);
    return new Promise((resolve, reject) => {
        readFile(filePath, (err, data) => {
            console.log(data, '读取文件时传入的数据');
            if (!err) {
                //将json字符串转化js对象
                let file = JSON.parse(data);
                resolve(file);
            } else {
                reject('readFileAsync方法出了问题：' + err);
            }
        })
    })
}


module.exports = {
    writeFileAsync,
    readFileAsync
}