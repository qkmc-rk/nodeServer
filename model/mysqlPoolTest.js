//TODO:所有数据库操作定义在此模块
var mysql = require('mysql');
var utils = require('../utils/utils');
var tokenMaster = require('../utils/tokenMaster');
var fs = require('fs');
var fdAuth = {};

//创建mysql数据库连接池，可以更好的对数据库连接进行管理，节约内存资源,connection.escape()  mysql模块自带的防sql注入函数  可以使用
var mysqlPool = mysql.createPool({
    host: "localhost", // TODO: 主机地址
    user: "root", // TODO: 数据库用户名
    password: "root", // TODO: 数据库密码
    database: "house", // TODO: 数据库名称
    port: 3306 // TODO: 端口号
});
//建立暴露数据库操作的接口
var dataOp = {
    //微信用户注册：插入数据操作
    wxUserLogin: function (req, res) {
        // token create and back to
        var openid = "abc";//这里随机写做测试，openid需要通过code获取
        var cash = "0";//初始金额为0
        mysqlPool.getConnection(function (err, connection) {
            if (err) {
                console.log('数据库连接池出错！');
                console.log(err);
                res.end(utils.createReturnData("200", "0", "", "user login failed!"));
                return;
            }
            var selectSql = "select * from userInfo where openid='" + openid + "';";
            connection.query(selectSql, function (err, rows) {
                if (err) {
                    console.log(err);
                    res.end(utils.createReturnData("200", "0", "", "user login failed!"));
                    return;
                }
                if (rows.length > 0) {
                    var tokenObj = {
                        "code": req.body.code,
                        "userInfo": req.body.userInfo,
                        "addData": "author:liubowen",

                    }
                    //当前用户已经存在，直接生成JWT令牌返回即可
                    var userToken = tokenMaster.createToken(tokenObj, 1800);//生成JWT令牌
                    var data = {};
                    data['id'] = openid;
                    data['userToken'] = userToken;
                    data["isFd"] = rows[0].isfd;
                    res.end(utils.createReturnData("200", "1", data, "user is exist!"));
                    return;
                }
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
                        res.end(utils.createReturnData("200", "0", "", "user login failed!"));
                    } else {
                        //成功
                        var userToken = tokenMaster.createToken(tokenObj, 1800);//生成JWT令牌
                        var data = {};
                        data['id'] = openid;
                        data['userToken'] = userToken;
                        data["isFd"] = "no";
                        res.end(utils.createReturnData("200", "1", data, "user login success!"));
                    }
                });
            });
            connection.release();
        });
    },
    upFdAuthPic: function (req, res) {
        mysqlPool.getConnection(function (err, connection) {
            if (err) {
                console.log('数据库连接池出错！');
                console.log(err);
                res.end(utils.createReturnData("200", "0", "", "user login failed!"));
                return;
            }
            if (req.files == undefined || req.files.length == 0) {
                return;
            } else {
                var imageindex = "";
                for (var i = 0; i < req.files.length; i++) {
                    var filepath = __dirname + "/../public/fdAuthpics/" + req.files[i].originalname;
                    imageindex = "/fdAuthpics/" + req.files[i].originalname;
                    fs.renameSync(req.files[i].path, filepath);
                }
                if (req.body.index == 0) {
                    fdAuth.fdAuth1 = imageindex;
                } else {
                    var finalfdAuth2 = imageindex + "&" + fdAuth.fdAuth1;
                    // var sql = "insert into userinfo(authPath) values('" + JSON.stringify(fdAuth) + "') where openid='"+req.body.id+"';";
                    var sql = 'update userinfo set authPath="' + finalfdAuth2 + '"where openid="' + req.body.id + '";';
                    connection.query(sql, function (err, resInsert) {
                        if (err) {
                            console.log(err);
                            res.end(utils.createReturnData("200", "0", "failed", "pics upload failed!"));
                            return;
                        } else {
                            res.end(utils.createReturnData("200", "1", "success", "pics upload success!"));
                            return;
                        }
                    });
                    connection.release();
                }

            }
        });

    },
    upUserAuthPic:function(req,res){
        mysqlPool.getConnection(function (err, connection) {
            if (err) {
                console.log('数据库连接池出错！');
                console.log(err);
                res.end(utils.createReturnData("200", "0", "", "user login failed!"));
                return;
            }
            if (req.files == undefined || req.files.length == 0) {
                return;
            } else {
                var imageindex = "";
                for (var i = 0; i < req.files.length; i++) {
                    var filepath = __dirname + "/../public/userAuthpics/" + req.files[i].originalname;
                    imageindex = "/userAuthpics/" + req.files[i].originalname;
                    fs.renameSync(req.files[i].path, filepath);
                }
                if (req.body.index == 0) {
                    fdAuth.fdAuth1 = imageindex;
                } else {
                    var finalfdAuth2 = imageindex + "&" + fdAuth.fdAuth1;

                    // var sql = "insert into userinfo(authPath) values('" + JSON.stringify(fdAuth) + "') where openid='"+req.body.id+"';";
                    var sql = "update housesets set holderinfo='" + req.body.userObj + "',userholderpic='" + finalfdAuth2 + "'where id='" + req.body.id + "';";
                    connection.query(sql, function (err, resInsert) {
                        if (err) {
                            console.log(err);
                            res.end(utils.createReturnData("200", "0", "failed", "pics upload failed!"));
                            return;
                        } else {
                            res.end(utils.createReturnData("200", "1", "success", "pics upload success!"));
                            return;
                        }
                    });
                    connection.release();
                }

            }
        });
    },
    getAllswipper:function(req,res){
        mysqlPool.getConnection(function (err, connection) {
            if (err) {
                console.log('数据库连接池出错！');
                console.log(err);
                res.end(utils.createReturnData("200", "0", "", "user login failed!"));
                return;
            }
            var isrelease = 'yes'
            var sql = "select imageindex from swipperpics where isdelete = 'no';";
            connection.query(sql, function (err, rows) {
                if (err) {
                    console.log(err);
                    res.end(utils.createReturnData("200", "0", "[]", "select failed!"));
                } else {
                    var data = {};
                    data.houseData = JSON.stringify(rows);
                    res.end(utils.createReturnData("200", "1", data, "select success!"));
                }
            })
            connection.release();
        }); 
    },
    upFdHouse: function (req, res) {
        mysqlPool.getConnection(function (err, connection) {
            if (err) {
                console.log('数据库连接池出错！');
                console.log(err);
                res.end(utils.createReturnData("200", "0", "", "user login failed!"));
                return;
            }
            if (req.files == undefined || req.files.length == 0) {
                return;
            } else {
                var imageindex = "";
                var joinpeople = "k";
                for (var i = 0; i < req.files.length; i++) {
                    var filepath = __dirname + "/../public/fdhouse/" + req.files[i].originalname;
                    imageindex = "/fdhouse/" + req.files[i].originalname;
                    fs.renameSync(req.files[i].path, filepath);
                }
                var sql = "insert into housesets (fdid,houseinfo,imageindex,joinpeople) values('" + req.body.id + "','" + req.body.houseInfo + "','" + imageindex + "','" + joinpeople + "');";
                connection.query(sql, function (err, resInsert) {
                    if (err) {
                        console.log(err);
                        res.end(utils.createReturnData("200", "0", "failed", "house insert failed!"));
                        return;
                    } else {
                        res.end(utils.createReturnData("200", "1", "success", "house insert success!"));
                        return;
                    }
                });
                connection.release();

            }
        });
    },
    getAllHouse: function (req, res) {
        mysqlPool.getConnection(function (err, connection) {
            if (err) {
                console.log('数据库连接池出错！');
                console.log(err);
                res.end(utils.createReturnData("200", "0", "", "user login failed!"));
                return;
            }
            var isrelease = 'yes'
            var sql = "select id,fdId,houseinfo,imageindex from housesets where isrelease='" + isrelease + "';";
            connection.query(sql, function (err, rows) {
                if (err) {
                    console.log(err);
                    res.end(utils.createReturnData("200", "0", "[]", "select failed!"));
                } else {
                    var data = {};
                    data.houseData = JSON.stringify(rows);
                    res.end(utils.createReturnData("200", "1", data, "select success!"));
                }
            })
            connection.release();
        });
    },
    getAllHouseById:function(){
        mysqlPool.getConnection(function (err, connection) {
            if (err) {
                console.log('数据库连接池出错！');
                console.log(err);
                res.end(utils.createReturnData("200", "0", "", "user login failed!"));
                return;
            }
            var isrelease = 'yes'
            var sql = "select * from housesets where isrelease='" + isrelease + "'and fdId='"+req.body.id+"';";
            connection.query(sql, function (err, rows) {
                if (err) {
                    console.log(err);
                    res.end(utils.createReturnData("200", "0", "[]", "select failed!"));
                } else {
                    var data = {};
                    data.houseData = JSON.stringify(rows);
                    res.end(utils.createReturnData("200", "1", data, "select success!"));
                }
            })
            connection.release();
        });
    },
    getAllHouseById:function(req,res){
        mysqlPool.getConnection(function (err, connection) {
            if (err) {
                console.log('数据库连接池出错！');
                console.log(err);
                res.end(utils.createReturnData("200", "0", "", "user login failed!"));
                return;
            }
            var isrelease = 'yes'
            var sql = "select * from housesets where isrelease='" + isrelease + "';";
            connection.query(sql, function (err, rows) {
                if (err) {
                    console.log(err);
                    res.end(utils.createReturnData("200", "0", "[]", "select failed!"));
                } else {
                    var data = {};
                    var newArr = [];
                    for(var i=0;i<rows.length;i++){
                        if(rows[i].joinpeople.indexOf(req.body.id) != -1){
                            newArr.push(rows[i]);
                        }
                    }
                    data.houseData = JSON.stringify(newArr);
                    res.end(utils.createReturnData("200", "1", data, "select success!"));
                }
            })
            connection.release();
        });
    },
    getAllHouseByScId:function(req,res){
        mysqlPool.getConnection(function (err, connection) {
            if (err) {
                console.log('数据库连接池出错！');
                console.log(err);
                res.end(utils.createReturnData("200", "0", "", "user login failed!"));
                return;
            }
            var isrelease = 'yes'
            var sql = "select * from housesets where isrelease='" + isrelease + "';";
            connection.query(sql, function (err, rows) {
                if (err) {
                    console.log(err);
                    res.end(utils.createReturnData("200", "0", "[]", "select failed!"));
                } else {
                    var data = {};
                    var newArr = [];
                    for(var i=0;i<rows.length;i++){
                        if(rows[i].scpeople.indexOf(req.body.id) != -1){
                            newArr.push(rows[i]);
                        }
                    }
                    data.houseData = JSON.stringify(newArr);
                    res.end(utils.createReturnData("200", "1", data, "select success!"));
                }
            })
            connection.release();
        });
    },
    backMsgs: function (req, res) {
        mysqlPool.getConnection(function (err, connection) {
            if (err) {
                console.log('数据库连接池出错！');
                console.log(err);
                res.end(utils.createReturnData("200", "0", "", "user login failed!"));
                return;
            }
            var isrelease = 'yes'
            var sql = "select * from systemmsg where isdelete='no'";
            connection.query(sql, function (err, rows) {
                if (err) {
                    console.log(err);
                    res.end(utils.createReturnData("200", "0", "[]", "select failed!"));
                } else {
                    res.end(utils.createReturnData("200", "1", JSON.stringify(rows), "select success!"));
                }
            })
            connection.release();
        });
    },
    updateJoinPeople: function (req, res) {
        mysqlPool.getConnection(function (err, connection) {
            if (err) {
                console.log('数据库连接池出错！');
                console.log(err);
                res.end(utils.createReturnData("200", "0", "", "user login failed!"));
                return;
            }
            var sql1 = 'select joinpeople from housesets where id="' + req.body.houseId + '";'
            connection.query(sql1, function (err, rows) {
                if (err) {
                    console.log(err);
                    res.end(utils.createReturnData("200", "0", "[]", "select failed!"));
                } else {
                    if (rows[0].joinpeople.indexOf(req.body.id) != -1) {
                        res.end(utils.createReturnData("200", "1", '', "select success!"));
                        return;
                    } else {
                        var sql = 'update housesets set joinpeople=concat(joinpeople,"' + req.body.id + '")where id="' + req.body.houseId + '";';
                        connection.query(sql, function (err, update) {
                            if (err) {
                                console.log(err);
                                res.end(utils.createReturnData("200", "0", "[]", "select failed!"));
                            } else {
                                res.end(utils.createReturnData("200", "1", '', "select success!"));
                            }
                        })
                    }
                }
            })
            connection.release();
        });
    },
    updateScPeople:function(req,res){
        mysqlPool.getConnection(function (err, connection) {
            if (err) {
                console.log('数据库连接池出错！');
                console.log(err);
                res.end(utils.createReturnData("200", "0", "", "user login failed!"));
                return;
            }
            var sql1 = 'select scpeople from housesets where id="' + req.body.houseId + '";'
            connection.query(sql1, function (err, rows) {
                if (err) {
                    console.log(err);
                    res.end(utils.createReturnData("200", "0", "[]", "select failed!"));
                } else {
                    if (rows[0].scpeople.indexOf(req.body.id) != -1) {
                        res.end(utils.createReturnData("200", "1", 'already', "select success!"));
                        return;
                    } else {
                        var sql = 'update housesets set scpeople=concat(scpeople,"' + req.body.id + '")where id="' + req.body.houseId + '";';
                        connection.query(sql, function (err, update) {
                            if (err) {
                                console.log(err);
                                res.end(utils.createReturnData("200", "0", "[]", "select failed!"));
                            } else {
                                res.end(utils.createReturnData("200", "1", '', "select success!"));
                            }
                        })
                    }
                }
            })
            connection.release();
        });
    }
}


module.exports = exports = dataOp;
