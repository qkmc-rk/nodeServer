//TODO:所有数据库操作定义在此模块
var mysql = require('mysql');
var utils = require('../utils/utils');
var tokenMaster = require('../utils/tokenMaster');
var connection;//数据库连接对象
//数据库连接
//****************************************************************************************************************************
function handleDisconnect() {
    connection = mysql.createConnection({
        host: "localhost", // TODO: 主机地址
        user: "root", // TODO: 数据库用户名
        password: "root", // TODO: 数据库密码
        database: "house", // TODO: 数据库名称
        port: 3306 // TODO: 端口号
    }); // Recreate the connection, since
    // the old one cannot be reused.
    connection.connect(function (err) { // The server is either down
        if (err) { // or restarting (takes a while sometimes).
            console.log('error when connecting to db:', err);
            setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
        } // to avoid a hot loop, and to allow our node script to
    }); // process asynchronous requests in the meantime.
    // If you're also serving http, display a 503 error.
    connection.on('error', function (err) {
        console.log('db error', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
            handleDisconnect(); // lost due to either server restart, or a
        } else { // connnection idle timeout (the wait_timeout
            throw err; // server variable configures this)
        }
    });
}
handleDisconnect();
//***********************************************************************************************************

//建立暴露数据库操作的接口
var dataOp = {
    //微信用户注册：插入数据操作
    wxUserLogin: function (req, res) {
        // token create and back to
        console.log(req.body.userInfo);
        var openid = "abc";//这里随机写做测试，openid需要通过code获取
        var cash = "0";//初始金额为0
        var sql = "insert into userinfo(openid,info,cash) values('" + openid + "','" + JSON.stringify(req.body.userInfo) + "','" + cash + "');";
        connection.query(sql, function (err, resupdate) {
            var tokenObj = {
                "code": req.body.code,
                "userInfo": req.body.userInfo,
                "addData": "author:liubowen"
              }
            if (err) {
                console.log(err);
                //失败
                res.end(utils.createReturnData("200","0","","user login failed!"));
            } else {
                //成功
                var userToken = tokenMaster.createToken(tokenObj, 1800);//生成JWT令牌
                res.end(utils.createReturnData("200","1",userToken,"user login success!"));
            }
        });
    }
}


module.exports = exports = dataOp;
