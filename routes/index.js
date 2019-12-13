var express = require('express');
var tokenMaster = require('../utils/tokenMaster');
var utils = require('../utils/utils');
var router = express.Router();
var model = require('../model/model');
var mysqlPoolTest = require('../model/mysqlPoolTest');
var multer = require('multer'); //这是一个Node.js的中间件处理multipart/form-data
var upload = multer({
  dest: './tmp'
});

// 微信端API继承**********************************************************************************************************
/* POST wxLogin api. */
router.post('/wxLogin', function (req, res) {
  mysqlPoolTest.wxUserLogin(req,res);
});
/* POST tokenCheck api. */
router.post('/tokenCheck', function (req, res) {
  if (tokenMaster.checkToken(req.body.token)) {
    res.end(utils.createReturnData("200","1","token未过期","user token is liggal"));
    return;
  } else {
    res.end(utils.createReturnData("200","0","token已过期","user token is inliggal"));
    return;
  }
});
//获取所有的系统消息
router.get('/getAllMsg',function(req,res){
  mysqlPoolTest.backMsgs(res,res);
});
//获取所有的轮播图
router.get('/getAllswipper',function(req,res){
  mysqlPoolTest.getAllswipper(res,res);
});
/* POST upFdAuthPic api. */
router.post('/upFdAuthPic',upload.array("file"), function(req, res){
  if (tokenMaster.checkToken(req.body.token)) {
    mysqlPoolTest.upFdAuthPic(req, res);
  } else {
    res.end(utils.createReturnData("200","0","token已过期","user token is inliggal"));
    return;
  }
});
/* POST upUserAuthPic api. */
router.post('/upUserAuthPic',upload.array("file"), function(req, res){
  if (tokenMaster.checkToken(req.body.token)) {
    mysqlPoolTest.upUserAuthPic(req, res);
  } else {
    res.end(utils.createReturnData("200","0","token已过期","user token is inliggal"));
    return;
  }
});
/* POST upFdHouse api. */
router.post('/upFdHouse',upload.array("file"), function(req, res){
  if (tokenMaster.checkToken(req.body.token)) {
    mysqlPoolTest.upFdHouse(req, res);
  } else {
    res.end(utils.createReturnData("200","0","token已过期","user token is inliggal"));
    return;
  }
});
/* POST updateJoinPeople api. */
router.post('/updateJoinPeople',function(req, res){
  if (tokenMaster.checkToken(req.body.token)) {
    mysqlPoolTest.updateJoinPeople(req, res);
  } else {
    res.end(utils.createReturnData("200","0","token已过期","user token is inliggal"));
    return;
  }
});

/* POST updateScPeople api. */
router.post('/updateScPeople',function(req, res){
  if (tokenMaster.checkToken(req.body.token)) {
    mysqlPoolTest.updateScPeople(req, res);
  } else {
    res.end(utils.createReturnData("200","0","token已过期","user token is inliggal"));
    return;
  }
});

/* POST getAllHouseById api. */
router.post('/getAllHouseById',function(req, res){
  if (tokenMaster.checkToken(req.body.token)) {
    mysqlPoolTest.getAllHouseById(req, res);
  } else {
    res.end(utils.createReturnData("200","0","token已过期","user token is inliggal"));
    return;
  }
});
/* GET getAllHouseById api. */
router.post('/getAllHouseById',function(req,res){
  mysqlPoolTest.getAllHouseById(req, res);
})
/* GET getAllHouseByScId api. */
router.post('/getAllHouseByScId',function(req,res){
  mysqlPoolTest.getAllHouseByScId(req, res);
})

/* GET getAllHouse api. */
router.get('/getAllHouse',function(req,res){
  mysqlPoolTest.getAllHouse(req, res);
})
// 微信端API继承**********************************************************************************************************

// 管理员端API继承**********************************************************************************************************

// 管理员端API继承**********************************************************************************************************

module.exports = router;
