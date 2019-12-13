var express = require('express');
//TODO:所有数据库操作定义在此模块
var mysql = require('mysql');
var utils = require('../utils/utils');
var tokenMaster = require('../utils/tokenMaster');//基于JWT用户状态保存机制
var crypto = require('crypto');
var router = express.Router();

//创建mysql数据库连接池，可以更好的对数据库连接进行管理，节约内存资源,connection.escape()  mysql模块自带的防sql注入函数  可以使用
var mysqlPool = mysql.createPool({
    host: "localhost", // TODO: 主机地址
    user: "root", // TODO: 数据库用户名
    password: "root", // TODO: 数据库密码
    database: "house", // TODO: 数据库名称
    port: 3306 // TODO: 端口号
});

/* GET manager index. */
router.get('/', function (req, res, next) {
    res.render('admin/index', { title: '管理员首页' });
});
/* GET admin login. */
router.get('/login', function (req, res, next) {
    res.render('admin/login', { title: '小鱼公寓' });
});
/* GET admin welcome. */
router.get('/welcome', function (req, res, next) {
    res.render('admin/welcome', { title: '欢迎界面' });
});

/* GET admin swipperlistadd. */
router.get('/swipperlistadd', function (req, res, next) {
    res.render('admin/swipperlistadd', { title: '欢迎界面' });
});
//上传轮播图
router.post('/swipperlistadd', function (req, res, next) {
    //先检查token
    
    //在进行上传
    res.render('admin/swipperlistadd', { title: '欢迎界面' });
});
/* GET admin swipperlist. */
router.get('/swipperlist', function (req, res, next) {
    res.render('admin/swipperlist', { title: '欢迎界面' });
});
/* POST admin token check. */
router.post('/tokenCheck', function (req, res) {
    var token = "";
    req.on('data', function (chunk) {
        token += chunk;
    });
    req.on('end', function () {
        console.log(token);
        if (tokenMaster.checkToken(token)) {
            //token 未过期 直接跳转到管理员首页
            res.end(utils.createReturnData("200", "1", "/manager/", "token is liggal!"));
            return;
        } else {
            res.end(utils.createReturnData("200", "0", "/manager/login", "token is inliggal!"));
            return;
        }
    });
});
/* POST admin login. */
router.post('/login', function (req, res, next) {
    console.log("test");
    var name = req.body.userName;
    var pwd = req.body.password;
    console.log(name + pwd);
    var md5 = crypto.createHash('md5');
    var password = md5.update(pwd).digest('hex');
    mysqlPool.getConnection(function (err, connection) {
        if (err) {
            console.log('数据库连接池出错！');
            console.log(err);
            res.end(utils.createReturnData("200", "0", "", "manager reg failed!"));
            return;
        }
        var sql = "select * from managerinfo where name='" + name + "';";
        connection.query(sql, function (err, rows) {
            var tokenObj = {
                "name": name,
                "userInfo": "no user info",
                "addData": "author:liubowen"
            }
            if (err) {
                console.log(err);
                //失败
                res.end(utils.createReturnData("200", "0", "", "user login failed!"));
            } else {
                if (rows.length > 0 && rows[0].pwd == password) {
                    var userToken = tokenMaster.createToken(tokenObj, 15);//生成JWT令牌
                    res.end(utils.createReturnData("200", "1", userToken, "user login success!"));
                } else {
                    res.end(utils.createReturnData("200", "0", "", "user input error!"));
                }
            }
        });
        connection.release();
    });
});
/* GET admin reg. 暂时开放管理员的注册功能，用于测试*/
router.get('/reg', function (req, res, next) {
    res.render('admin/reg', { title: '管理员注册' });
});
/* POST admin reg. */
router.post('/reg', function (req, res, next) {
    var name = req.body.userName;
    var pwd = req.body.password;
    var md5 = crypto.createHash('md5');
    var password = md5.update(pwd).digest('hex');
    mysqlPool.getConnection(function (err, connection) {
        if (err) {
            console.log('数据库连接池出错！');
            console.log(err);
            res.end(utils.createReturnData("200", "0", "", "manager reg failed!"));
            return;
        }
        var sql = "insert into managerinfo(name,pwd) values('" + name + "','" + password + "');";
        connection.query(sql, function (err, resupdate) {
            var tokenObj = {
                "name": name,
                "userInfo": "no user info",
                "addData": "author:liubowen"
            }
            if (err) {
                console.log(err);
                //失败
                res.end(utils.createReturnData("200", "0", "", "user reg failed!"));
            } else {
                //成功
                var userToken = tokenMaster.createToken(tokenObj, 1800);//生成JWT令牌
                res.end(utils.createReturnData("200", "1", userToken, "user reg success!"));
            }
        });
        connection.release();
    });
});

module.exports = router;
