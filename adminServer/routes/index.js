var express = require('express');
var router = express.Router();
var crypto = require('crypto'),
    User = require('../models/user.js')
var mongodb = require('../models/db');
var mysql = require('mysql');
var token = require('../utils/Token');
var mongoose = require('mongoose');
var ObjectId = require('mongodb').ObjectId
var fs = require('fs'); //文件操作
var multer = require('multer'); //这是一个Node.js的中间件处理multipart/form-data
var upload = multer({
  dest: './tmp'
});
var connection;

//****************************************************************************************************************************
function handleDisconnect() {
  connection = mysql.createConnection({
    host: "localhost", // TODO: 主机地址
    user: "root", // TODO: 数据库用户名
    password: "123456", // TODO: 数据库密码
    database: "house", // TODO: 数据库名称
    port: 3306 // TODO: 端口号
  }); // Recreate the connection, since
  // the old one cannot be reused.
  connection.connect(function(err) { // The server is either down
    if (err) { // or restarting (takes a while sometimes).
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
    } // to avoid a hot loop, and to allow our node script to
  }); // process asynchronous requests in the meantime.
  // If you're also serving http, display a 503 error.
  connection.on('error', function(err) {
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


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('bodyRoom', { title: 'Express' });
});
/* GET bodyRoom page. */
router.get('/bodyRoom', function(req, res, next) {
  res.render('bodyRoom', { title: '健身房详情' });
});
/* GET bodyFood page. */
router.get('/bodyFood', function(req, res, next) {
  res.render('bodyFood', { title: '健身餐详情' });
});
/* GET addrInput page. */
router.get('/addrInput', checkUserLogin);
router.get('/addrInput', function(req, res, next) {
  res.render('addrInput', {
    title: '签到',
    user: req.session.normaluser,
    success: req.flash('success').toString(),
    error: req.flash('error').toString()
  });
});
/* GET datashow page. */
router.get('/datashow', checkUserLogin);
router.get('/datashow', function(req, res, next) {
  res.render('datashow', {
    title: '签到',
    user: req.session.normaluser,
    success: req.flash('success').toString(),
    error: req.flash('error').toString()
  });
});
/* GET sign page. */
router.get('/sign', checkUserLogin);
router.get('/sign', function(req, res, next) {
  var sql = "select * from signtab where isdelete='no'";
  connection.query(sql, function(err, rows) {
    if (err) {
      console.log(err);
      // res.end(JSON.stringify([]));
      return res.render('sign', {
        title: '同城广场',
        user: req.session.normaluser,
        success: req.flash('success').toString(),
        error: req.flash('error').toString(),
        results:[]
      });
    } else {
      if(rows.length > 0){
        // res.end(JSON.stringify(rows));
        return res.render('sign', {
          title: '同城广场',
          user: req.session.normaluser,
          success: req.flash('success').toString(),
          error: req.flash('error').toString(),
          results:rows
        });
      }else{
        return res.render('sign', {
          title: '同城广场',
          user: req.session.normaluser,
          success: req.flash('success').toString(),
          error: req.flash('error').toString(),
          results:[]
        });
      }
    }
  });
});
//获取所有的签到getAllBodyFood
router.get('/getAllBodyFood', checkUserLogin);
router.get('/getAllBodyFood', function(req, res, next) {
  var sql = "select * from bodyfood where isdelete='no'";
  connection.query(sql, function(err, rows) {
    if (err) {
      console.log(err);
      res.end(JSON.stringify([]));
      return;
    } else {
      if(rows.length > 0){
        res.end(JSON.stringify(rows));
        return;
      }else{
        res.end(JSON.stringify([]));
        return;
      }
    }
  });
});
//获取所有的签到getAllBodyFood
router.get('/getAllOrder', checkUserLogin);
router.get('/getAllOrder', function(req, res, next) {
  var sql = "select * from orderlist";
  connection.query(sql, function(err, rows) {
    if (err) {
      console.log(err);
      res.end(JSON.stringify([]));
      return;
    } else {
      if(rows.length > 0){
        res.end(JSON.stringify(rows));
        return;
      }else{
        res.end(JSON.stringify([]));
        return;
      }
    }
  });
});
//用户下单
router.post('/addrInput', checkUserLogin);
router.post('/addrInput', function(req, res, next) {
  var userName = req.session.normaluser.name;
  var sql = "insert into orderlist(userName,name,tel,addr,foodid) values('" + userName + "','" + req.body.name + "','" + req.body.tel + "','" + req.body.addr + "','" + req.body.foodid + "');";
      connection.query(sql, function(err, resInsert) {
        if (err) {
          console.log(err);
          req.flash('error', '下单失败！￣へ￣');
          return res.redirect('/addrInput');
          return;
        } else {
          // res.send('添加成功');
          req.flash('error', "下单成功！O(∩_∩)O");
          return res.redirect('/addrInput');
        }
      });
});
/* GET mime page. */
router.get('/mime', checkUserLogin);
router.get('/mime', function(req, res, next) {
  res.render('mime', {
    title: '登录',
    user: req.session.normaluser,
    pic:req.session.normaluser.name[0],
    success: req.flash('success').toString(),
    error: req.flash('error').toString()
  });
});
// 常规用户登录
router.get('/userLogin', checkUserNotLogin);
router.get('/userLogin', function(req, res, next) {
  res.render('userLogin',  {
    title: '登录',
    user: req.session.normaluser,
    success: req.flash('success').toString(),
    error: req.flash('error').toString()
  });
});
//常规用户注册
// router.get('/userReg', checkUserLogin);
  router.get('/userReg', function (req, res) {
    res.render('userReg', {
      title: '注册',
      user: req.session.normaluser,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });


// *************************** GET ADMIN PAGES ***************************************
/* GET admin login page. */
router.get('/admin/login', checkNotLogin);
router.get('/admin/login', function(req, res, next) {
  res.render('admin/login', { title: '填写地址' });
});
/* GET admin index page. */
router.get('/admin/index', checkLogin);
router.get('/admin/index', function(req, res, next) {
  res.render('admin/index', { title: '填写地址' });
});
/* GET admin welcome page. */
router.get('/welcome', checkLogin);
router.get('/welcome', function(req, res, next) {
  res.render('admin/welcome', { title: '填写地址' });
});
/* GET admin welcome1 page. */
router.get('/admin/welcome1', checkLogin);
router.get('/admin/welcome1', function(req, res, next) {
  res.render('admin/welcome1', { title: '填写地址' });
});
/* GET admin error page. */
router.get('/admin/error', checkLogin);
router.get('/admin/error', function(req, res, next) {
  res.render('admin/error', { title: '填写地址' });
});
/* GET admin order-list page. */
router.get('/admin/order-list', checkLogin);
router.get('/admin/order-list', function(req, res, next) {
  res.render('admin/order-list', { title: '填写地址' });
});
/* GET admin order-list1 page. */
router.get('/admin/order-list1', checkLogin);
router.get('/admin/order-list1', function(req, res, next) {
  res.render('admin/order-list1', { title: '填写地址' });
});
/* GET admin city page. */
router.get('/admin/city', checkLogin);
router.get('/admin/city', function(req, res, next) {
  res.render('admin/city', { title: '填写地址' });
});
/* GET admin unicode page. */
router.get('/admin/unicode', checkLogin);
router.get('/admin/unicode', function(req, res, next) {
  res.render('admin/unicode', { title: '填写地址' });
});
/* GET admin list page. */
router.get('/admin/admin-list', checkLogin);
router.get('/admin/admin-list', function(req, res, next) {
  res.render('admin/admin-list', { title: '填写地址' });
});
/* GET member list page. */
router.get('/admin/member-list', checkLogin);
router.get('/admin/member-list', function(req, res, next) {
  res.render('admin/member-list', { title: '填写地址' });
});
/* GET bodyfood list page. */
router.get('/admin/bodyfoodlist', checkLogin);
router.get('/admin/bodyfoodlist', function(req, res, next) {
  res.render('admin/bodyfoodlist', { title: '填写地址' });
});
/* GET user list page. */
router.get('/admin/userlist', checkLogin);
router.get('/admin/userlist', function(req, res, next) {
  res.render('admin/userlist', { title: '填写地址' });
});
/* GET userfd list page. */
router.get('/admin/userlist_fd', checkLogin);
router.get('/admin/userlist_fd', function(req, res, next) {
  res.render('admin/userlist_fd', { title: '填写地址' });
});
/* GET pro list page. */
router.get('/admin/prolist', checkLogin);
router.get('/admin/prolist', function(req, res, next) {
  res.render('admin/prolist', { title: '填写地址' });
});
/* GET user list page. */
router.get('/admin/plist', checkLogin);
router.get('/admin/plist', function(req, res, next) {
  res.render('admin/plist', { title: '填写地址' });
});
/* GET  htlist page. */
router.get('/admin/htlist', checkLogin);
router.get('/admin/htlist', function(req, res, next) {
  res.render('admin/htlist', { title: '填写地址' });
});
/* GET swipperlist list page. */
router.get('/admin/swipperlist', checkLogin);
router.get('/admin/swipperlist', function(req, res, next) {
  res.render('admin/swipperlist', { title: '填写地址' });
});
/* GET swipperlist list page. */
router.get('/admin/msglist', checkLogin);
router.get('/admin/msglist', function(req, res, next) {
  res.render('admin/msglist', { title: '填写地址' });
});
/* GET swipperlist list page. */
router.get('/admin/msglist_add', checkLogin);
router.get('/admin/msglist_add', function(req, res, next) {
  res.render('admin/msglist_add', { title: '填写地址' });
});
/* GET activitylist list page. */
router.get('/admin/activitylist', checkLogin);
router.get('/admin/activitylist', function(req, res, next) {
  res.render('admin/activitylist', { title: '填写地址' });
});
/* GET order list page. */
router.get('/admin/orderlist', checkLogin);
router.get('/admin/orderlist', function(req, res, next) {
  res.render('admin/orderlist', { title: '填写地址' });
});
/* GET orderdatalist page. */
router.get('/admin/orderdatalist', checkLogin);
router.get('/admin/orderdatalist', function(req, res, next) {
  res.render('admin/orderdatalist', { title: '填写地址' });
});
/* GET dongtailis list page. */
router.get('/admin/dongtailist', checkLogin);
router.get('/admin/dongtailist', function(req, res, next) {
  res.render('admin/dongtailist', { title: '填写地址' });
});
/* GET member list page. */
router.get('/admin/member-add', checkLogin);
router.get('/admin/member-add', function(req, res, next) {
  res.render('admin/member-add', { title: '填写地址' });
});
/* GET bodyfood add list page. */
router.get('/admin/bodyfoodadd', checkLogin);
router.get('/admin/bodyfoodadd', function(req, res, next) {
  res.render('admin/bodyfoodadd', { title: '填写地址' });
});
/* GET swipperlistadd list page. */
router.get('/admin/swipperlistadd', checkLogin);
router.get('/admin/swipperlistadd', function(req, res, next) {
  res.render('admin/swipperlistadd', { title: '填写地址' });
});
/* GET activityAdd list page. */
router.get('/admin/activityAdd', checkLogin);
router.get('/admin/activityAdd', function(req, res, next) {
  res.render('admin/activityAdd', { title: '填写地址' });
});
/* GET p list page. */
router.get('/admin/plistadd', checkLogin);
router.get('/admin/plistadd', function(req, res, next) {
  res.render('admin/plistadd', { title: '填写地址' });
});
/* GET pro list page. */
router.get('/admin/prolistadd', checkLogin);
router.get('/admin/prolistadd', function(req, res, next) {
  res.render('admin/prolistadd', { title: '填写地址' });
});
/* GET pro list page. */
// router.get('/admin/prolistadd', checkLogin);
// router.get('/admin/prolistadd', function(req, res, next) {
//   res.render('admin/prolistadd', { title: '填写地址' });
// });


//注册代码
  router.get('/admin/reg', checkNotLogin);
  router.get('/admin/reg', function (req, res) {
    res.render('admin/reg', {
      title: '注册',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
//管理员隐藏注册代码
router.post('/admin/reg', checkNotLogin);
router.post('/admin/reg', function (req, res) {
  var name = req.body.name,
      password = req.body.password,
      password_re = req.body['password-repeat'];
  if (password_re != password) {
    req.flash('error', '两次输入的密码不一致!');
    return res.redirect('/reg');
  }
  var md5 = crypto.createHash('md5'),
      password = md5.update(req.body.password).digest('hex');
  var newUser = new User({
    name: name,
    password: password,
    email: req.body.email,
    type:"manager"
  });
  User.get(newUser.name, function (err, user) {
    if (err) {
      req.flash('error', err);
      return res.redirect('/admin/login');
    }
    if (user) {
      req.flash('error', '用户已存在!');
      return res.redirect('/reg');
    }
    newUser.save(function (err, user) {
      if (err) {
        req.flash('error', err);
        return res.redirect('/reg');
      }
      req.session.user = user;
      // req.flash('success', '注册成功!');
      res.redirect('/admin/login');
      return;
    });
  });
});

//常规用户注册
//管理员隐藏注册代码
router.post('/userReg', checkUserNotLogin);
router.post('/userReg', function (req, res) {
  var name = req.body.name,
      password = req.body.password,
      password_re = req.body['password-repeat'];
  if (password_re != password) {
    req.flash('error', '两次输入的密码不一致!');
    return res.redirect('/userReg');
  }
  var md5 = crypto.createHash('md5'),
      password = md5.update(String(req.body.password)).digest('hex');
  var newUser = new User({
    name: name,
    password: password,
    tel: req.body.tel,
    type:"mormalUser"
  });
  User.getNormal(newUser.name, function (err, user) {
    if (err) {
      req.flash('error', err);
      return res.redirect('/userLogin');
    }
    if (user) {
      req.flash('error', '用户已存在!');
      return res.redirect('/userReg');
    }
    newUser.saveNormal(function (err, user) {
      if (err) {
        req.flash('error', err);
        return res.redirect('/userReg');
      }
      req.session.normaluser = user;
      // req.flash('success', '注册成功!');
      res.redirect('/UserLogin');
      return;
    });
  });
});

//管理员登录
router.post('/admin/login', checkNotLogin);
  router.post('/admin/login', function (req, res) {
    var md5 = crypto.createHash('md5'),
        password = md5.update(req.body.password).digest('hex');
    User.get(req.body.name, function (err, user) {
      if (!user) {
        req.flash('error', '用户不存在!');
        return res.redirect('/admin/login');
      }
      if (user.password != password) {
        req.flash('error', '密码错误!');
        return res.redirect('/admin/login');
      }
      req.session.user = user;
      // req.flash('success', '登陆成功!');
      res.redirect('/admin/index');
      return;
    });
  });
//常规用户登录
router.post('/userLogin', checkUserNotLogin);
  router.post('/userLogin', function (req, res) {
    var md5 = crypto.createHash('md5'),
        password = md5.update(String(req.body.password)).digest('hex');
    User.getNormal(req.body.name, function (err, user) {
      if (!user) {
        req.flash('error', '用户不存在!');
        return res.redirect('/userLogin');
      }
      if (user.password != password) {
        req.flash('error', '密码错误!');
        return res.redirect('/userLogin');
      }
      req.session.normaluser = user;
      // req.flash('success', '登陆成功!');
      res.redirect('/dataShow');
      return;
    });
  });
  router.get('/admin/logout', function(req, res) {
    req.session.user = null;
    req.flash('success', '登出成功!');
    res.redirect('/admin/login');
  });
  //addBody
  //管理员上传健身房
  router.post('/admin/addBody', checkLogin);
  router.post('/admin/addBody', upload.array("file"), function(req, res, next) {
    var name;
    var tel;
    var location;
    var content;
    var isdelete = "no";
    var imageIndex;
    var imageIndexArr = [];
    if (req.body != undefined) {
      name = req.body.name;
      tel = req.body.tel;
      location = req.body.location;
      content = req.body.content;
    } else {
      res.send("上传参数错误,请重新上传");
      return;
    }
    // console.log(req.files);
    if (req.files == undefined || req.files.length == 0) {
      res.send("请选择要上传的文件...");
      return;
    } else {
      var str = "上传成功...";
      for (var i = 0; i < req.files.length; i++) {
        var filepath = __dirname + "/../public/bodyroom/" + req.files[i].originalname;
        imageIndex = "/bodyroom/" + req.files[i].originalname;
        imageIndexArr.push(imageIndex);
        fs.renameSync(req.files[i].path, filepath);
      }
      var sql = "insert into bodyroom(name,tel,location,content,coverindex,carIndex1,carIndex2,carIndex3,isdelete) values('" + name + "','" + tel + "','" + location + "','" + content + "','"  + imageIndexArr[0] + "','" + imageIndexArr[1] + "','"  + imageIndexArr[2] + "','"  + imageIndexArr[3] + "','"  + isdelete + "');";
      connection.query(sql, function(err, resInsert) {
        if (err) {
          console.log(err);
          res.send('添加失败,请重试');
          return;
        } else {
          res.send('添加成功');
          return;
        }
      });
    }
  });


    //管理员上传健身房
    router.post('/admin/addfood', checkLogin);
    router.post('/admin/addfood', upload.array("file"), function(req, res, next) {
      var name;
      var tel;
      var kll;
      var pl;
      var sm;
      var price;
      var isdelete = "no";
      var imageIndex;
      if (req.body != undefined) {
        name = req.body.name;
        tel = req.body.tel;
        price = req.body.price;
        pl = req.body.pl;
        sm = req.body.sm;
        content = req.body.content;
        kll = req.body.kll;
      } else {
        res.send("上传参数错误,请重新上传");
        return;
      }
      // console.log(req.files);
      if (req.files == undefined || req.files.length == 0) {
        res.send("请选择要上传的文件...");
        return;
      } else {
        var str = "上传成功...";
        for (var i = 0; i < req.files.length; i++) {
          var filepath = __dirname + "/../public/bodyfood/" + req.files[i].originalname;
          imageIndex = "/bodyfood/" + req.files[i].originalname;
          fs.renameSync(req.files[i].path, filepath);
        }
        var sql = "insert into bodyfood(name,tel,price,foodhot,imageindex,pl,sm,isdelete) values('" + name + "','" + tel + "','" + price + "','" + kll + "','"  + imageIndex + "','" + pl+ "','"  + sm + "','"  + isdelete + "');";
        connection.query(sql, function(err, resInsert) {
          if (err) {
            console.log(err);
            res.send('添加失败,请重试');
            return;
          } else {
            res.send('添加成功');
            return;
          }
        });
      }
    });
    //管理员上传活动
    router.post('/admin/addactivity', checkLogin);
    router.post('/admin/addactivity', upload.array("file"), function(req, res, next) {
      var name;
      var people;
      var updat;
      var howlong;
      var sm;
      var isdelete = "no";
      var imageIndex;
      if (req.body != undefined) {
        name = req.body.name;
        howlong = req.body.howlong;
        updat = req.body.updat;
        people = req.body.people;
        sm = req.body.sm;
      } else {
        res.send("上传参数错误,请重新上传");
        return;
      }
      // console.log(req.files);
      if (req.files == undefined || req.files.length == 0) {
        res.send("请选择要上传的文件...");
        return;
      } else {
        var str = "上传成功...";
        for (var i = 0; i < req.files.length; i++) {
          var filepath = __dirname + "/../public/ac/" + req.files[i].originalname;
          imageIndex = "/ac/" + req.files[i].originalname;
          fs.renameSync(req.files[i].path, filepath);
        }
        var sql = "insert into acdata(name,sm,people,howlong,updat,imageindex,isdelete) values('" + name + "','" + sm + "','" + people + "','" + howlong + "','"  + updat + "','"  + imageIndex + "','"  + isdelete + "');";
        connection.query(sql, function(err, resInsert) {
          if (err) {
            console.log(err);
            res.send('添加失败,请重试');
            return;
          } else {
            res.send('添加成功');
            return;
          }
        });
      }
    });
    //管理员上传活动
    router.post('/admin/addPro', checkLogin);
    router.post('/admin/addPro', upload.array("file"), function(req, res, next) {
      var name;
      var price;
      var time;
      var type;
      var sm;
      var ptype;
      var isdelete = "no";
      var imageIndex;
      if (req.body != undefined) {
        name = req.body.name;
        price = req.body.price;
        time = req.body.time;
        type = req.body.type;
        ptype = req.body.ptype;
        sm = req.body.sm;
      } else {
        res.send("上传参数错误,请重新上传");
        return;
      }
      // console.log(req.files);
      if (req.files == undefined || req.files.length == 0) {
        res.send("请选择要上传的文件...");
        return;
      } else {
        var str = "上传成功...";
        for (var i = 0; i < req.files.length; i++) {
          var filepath = __dirname + "/../public/pro/" + req.files[i].originalname;
          imageIndex = "/pro/" + req.files[i].originalname;
          fs.renameSync(req.files[i].path, filepath);
        }
        var sql = "insert into prodata(name,price,time,type,ptype,sm,imageindex,isdelete) values('" + name + "','" + price + "','" + time + "','" + type + "','"  + ptype + "','"  + sm + "','"  + imageIndex + "','"  + isdelete + "');";
        connection.query(sql, function(err, resInsert) {
          if (err) {
            console.log(err);
            res.send('添加失败,请重试');
            return;
          } else {
            res.send('添加成功');
            return;
          }
        });
      }
    });
    //上传品牌
    router.post('/admin/addp', checkLogin);
    router.post('/admin/addp',function(req,res){
      var name = req.body.name;
      console.log(name)
      var isdelete = "no";
      var sql = "insert into ppd(name,isdelete) values('" + name + "','"  + isdelete + "');";
        connection.query(sql, function(err, resInsert) {
          if (err) {
            console.log(err);
            res.send('添加失败,请重试');
            return;
          } else {
            res.send('添加成功');
            return;
          }
        });
    })

//管理员添加swipper轮播图
    router.post('/admin/addswipper', checkLogin);
    router.post('/admin/addswipper', upload.array("file"), function(req, res, next) {
      var sm;
      var price;
      var isdelete = "no";
      var imageIndex;
      if (req.body != undefined) {
        sm = req.body.sm;
      } else {
        res.send("上传参数错误,请重新上传");
        return;
      }
      // console.log(req.files);
      if (req.files == undefined || req.files.length == 0) {
        res.send("请选择要上传的文件...");
        return;
      } else {
        var str = "上传成功...";
        for (var i = 0; i < req.files.length; i++) {
          var filepath = __dirname + "/../public/swipper/" + req.files[i].originalname;
          var appPath = "../../public/swipper/"+ req.files[i].originalname;
          imageIndex = "/swipper/" + req.files[i].originalname;
          fs.renameSync(req.files[i].path, filepath);
        }
        var sql = "insert into swipperpics(imageindex,sm,isdelete) values('" +  imageIndex + "','"  + sm + "','"  + isdelete + "');";
        connection.query(sql, function(err, resInsert) {
          if (err) {
            console.log(err);
            res.send('添加失败,请重试');
            return;
          } else {
            res.send('添加成功');
            return;
          }
        });
      }
    });

    function getNowFormatDate() {
    var date = new Date();
    var seperator1 = "-";
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
    var currentdate = year + seperator1 + month + seperator1 + strDate;
    return currentdate;
}

    //管理员添加swipper轮播图
    router.post('/admin/addmsg', checkLogin);
    router.post('/admin/addmsg', upload.array("file"), function(req, res, next) {
      var sm;
      var price;
      var isdelete = "no";
      var imageIndex;
      if (req.body != undefined) {
        sm = req.body.sm;
      } else {
        res.send("上传参数错误,请重新上传");
        return;
      }
      // console.log(req.files);
      if (req.files == undefined || req.files.length == 0) {
        res.send("请选择要上传的文件...");
        return;
      } else {
        var str = "上传成功...";
        for (var i = 0; i < req.files.length; i++) {
          var filepath = __dirname + "/../public/swipper/" + req.files[i].originalname;
          imageIndex = "/swipper/" + req.files[i].originalname;
          fs.renameSync(req.files[i].path, filepath);
        }
        var sql = "insert into systemmsg(imageindex,con,isdelete,time) values('" +  imageIndex + "','"  + sm + "','"  + isdelete + "','"  + getNowFormatDate() + "');";
        connection.query(sql, function(err, resInsert) {
          if (err) {
            console.log(err);
            res.send('添加失败,请重试');
            return;
          } else {
            res.send('添加成功');
            return;
          }
        });
      }
    });


//用户打卡
//管理员上传健身房
router.post('/addSign', checkUserLogin);
router.post('/addSign', upload.array("file"), function(req, res, next) {
  var startDate;
  var startTime;
  var endDate;
  var endTime;
  var content;
  var userName = req.session.normaluser.name;
  var imageIndex;
  if (req.body != undefined) {
    startDate = req.body.startDate;
    startTime = req.body.startTime;
    endDate = req.body.endDate;
    endTime = req.body.endTime;
    content = req.body.content;
  } else {
    res.send("上传参数错误,请重新上传");
    return;
  }
  // console.log(req.files);
  if (req.files == undefined || req.files.length == 0) {
    res.send("请选择要上传的文件...");
    return;
  } else {
    var str = "上传成功...";
    for (var i = 0; i < req.files.length; i++) {
      var filepath = __dirname + "/../public/signpic/" + req.files[i].originalname;
      imageIndex = "/signpic/" + req.files[i].originalname;
      fs.renameSync(req.files[i].path, filepath);
    }
    var sql = "insert into signtab(userName,startDate,startTime,endDate,endTime,content,imageindex) values('" + userName + "','" + startDate + "','" + startTime + "','" + endDate + "','"  + endTime + "','" + content+ "','"  + imageIndex + "');";
    connection.query(sql, function(err, resInsert) {
      if (err) {
        console.log(err);
        req.flash('error', '打卡失败！￣へ￣');
        return res.redirect('/datashow');
        return;
      } else {
        // res.send('添加成功');
        req.flash('error', "打卡成功！O(∩_∩)O");
        return res.redirect('/datashow');
      }
    });
  }
});
//获取所有的健身房
router.post('/getAllBodyRoom', checkLogin);
router.get('/getAllBodyRoom',function(req,res){
  var sql = 'select * from bodyroom where isdelete="no";';
  connection.query(sql, function(err, rows) {
    if (err) {
      console.log(err);
      res.end(JSON.stringify([]));
      return;
    } else {
      if(rows.length > 0){
        res.end(JSON.stringify(rows));
      }else{
        res.end(JSON.stringify([]));
      }
    }
  });
});
//获取所有的食物
router.post('/getAllBodyFood', checkLogin);
router.get('/getAllBodyFood',function(req,res){
  var sql = 'select * from bodyfood where isdelete="no";';
  connection.query(sql, function(err, rows) {
    if (err) {
      console.log(err);
      res.end(JSON.stringify([]));
      return;
    } else {
      if(rows.length > 0){
        res.end(JSON.stringify(rows));
      }else{
        res.end(JSON.stringify([]));
      }
    }
  });
});
//获取所有的食物
router.get('/getAllac', checkLogin);
router.get('/getAllac',function(req,res){
  var sql = 'select * from housesets;';
  connection.query(sql, function(err, rows) {
    if (err) {
      console.log(err);
      res.end(JSON.stringify([]));
      return;
    } else {
      if(rows.length > 0){
        res.end(JSON.stringify(rows));
      }else{
        res.end(JSON.stringify([]));
      }
    }
  });
});
router.get('/getAllOrderlist', checkLogin);
router.get('/getAllOrderlist',function(req,res){
  var sql = 'select * from orderdata;';
  connection.query(sql, function(err, rows) {
    if (err) {
      console.log(err);
      res.end(JSON.stringify([]));
      return;
    } else {
      if(rows.length > 0){
        res.end(JSON.stringify(rows));
      }else{
        res.end(JSON.stringify([]));
      }
    }
  });
});
//获取所有的食物
router.get('/getAllht', checkLogin);
router.get('/getAllht',function(req,res){
  var sql = 'select * from htdata;';
  connection.query(sql, function(err, rows) {
    if (err) {
      console.log(err);
      res.end(JSON.stringify([]));
      return;
    } else {
      if(rows.length > 0){
        res.end(JSON.stringify(rows));
      }else{
        res.end(JSON.stringify([]));
      }
    }
  });
});
//获取所有的食物
router.get('/getAllPro', checkLogin);
router.get('/getAllPro',function(req,res){
  var sql = 'select * from prodata where isdelete="no";';
  connection.query(sql, function(err, rows) {
    if (err) {
      console.log(err);
      res.end(JSON.stringify([]));
      return;
    } else {
      if(rows.length > 0){
        res.end(JSON.stringify(rows));
      }else{
        res.end(JSON.stringify([]));
      }
    }
  });
});
//获取所有的食物
router.post('/getAllPro',function(req,res){
  var sql = 'select * from prodata where isdelete="no";';
  connection.query(sql, function(err, rows) {
    if (err) {
      console.log(err);
      res.end(JSON.stringify([]));
      return;
    } else {
      if(rows.length > 0){
        res.end(JSON.stringify(rows));
      }else{
        res.end(JSON.stringify([]));
      }
    }
  });
});
router.post('/getAllchat',function(req,res){
  var sql = 'select * from htdata where isdelete="no";';
  connection.query(sql, function(err, rows) {
    if (err) {
      console.log(err);
      res.end(JSON.stringify([]));
      return;
    } else {
      if(rows.length > 0){
        res.end(JSON.stringify(rows));
      }else{
        res.end(JSON.stringify([]));
      }
    }
  });
});
//获取所有的品牌
router.get('/getAllp', checkLogin);
router.get('/getAllp',function(req,res){
  var sql = 'select * from ppd where isdelete="no";';
  connection.query(sql, function(err, rows) {
    if (err) {
      console.log(err);
      res.end(JSON.stringify([]));
      return;
    } else {
      if(rows.length > 0){
        res.end(JSON.stringify(rows));
      }else{
        res.end(JSON.stringify([]));
      }
    }
  });
});
//getProByType
router.post('/getProByType',function(req,res){
  var sql = 'select * from prodata where type="'+req.body.type+'"and isdelete="no";';
  connection.query(sql, function(err, rows) {
    if (err) {
      console.log(err);
      res.end(JSON.stringify([]));
      return;
    } else {
      if(rows.length > 0){
        res.end(JSON.stringify(rows));
      }else{
        res.end(JSON.stringify([]));
      }
    }
  });
});
//getProById
router.post('/getProById',function(req,res){
  var sql = 'select * from prodata where id="'+req.body.id+'"and isdelete="no";';
  connection.query(sql, function(err, rows) {
    if (err) {
      console.log(err);
      res.end(JSON.stringify([]));
      return;
    } else {
      if(rows.length > 0){
        res.end(JSON.stringify(rows));
      }else{
        res.end(JSON.stringify([]));
      }
    }
  });
});
//getProById
router.post('/getHtById',function(req,res){
  var sql = 'select * from htdata where id="'+req.body.id+'"and isdelete="no";';
  connection.query(sql, function(err, rows) {
    if (err) {
      console.log(err);
      res.end(JSON.stringify([]));
      return;
    } else {
      if(rows.length > 0){
        res.end(JSON.stringify(rows));
      }else{
        res.end(JSON.stringify([]));
      }
    }
  });
});
//获取所有的用户
router.get('/getAllUser', checkLogin);
router.get('/getAllUser',function(req,res){
  var sql = 'select * from userinfo';
  connection.query(sql, function(err, rows) {
    if (err) {
      console.log(err);
      res.end(JSON.stringify([]));
      return;
    } else {
      if(rows.length > 0){
        res.end(JSON.stringify(rows));
      }else{
        res.end(JSON.stringify([]));
      }
    }
  });
});
//获取所有房东申请
router.get('/getAllUser_fd', checkLogin);
router.get('/getAllUser_fd',function(req,res){
  var sql = 'select * from userinfo where authPath <> "no"';
  connection.query(sql, function(err, rows) {
    if (err) {
      console.log(err);
      res.end(JSON.stringify([]));
      return;
    } else {
      if(rows.length > 0){
        res.end(JSON.stringify(rows));
      }else{
        res.end(JSON.stringify([]));
      }
    }
  });
});
//获取所有的食物
router.get('/getAllSwipper', checkLogin);
router.get('/getAllSwipper',function(req,res){
  var sql = 'select * from swipperpics where isdelete="no";';
  connection.query(sql, function(err, rows) {
    if (err) {
      console.log(err);
      res.end(JSON.stringify([]));
      return;
    } else {
      if(rows.length > 0){
        res.end(JSON.stringify(rows));
      }else{
        res.end(JSON.stringify([]));
      }
    }
  });
});
//获取所有的系统消息
router.get('/getAllMsg', checkLogin);
router.get('/getAllMsg',function(req,res){
  var sql = 'select * from systemmsg where isdelete="no"';
  connection.query(sql, function(err, rows) {
    if (err) {
      console.log(err);
      res.end(JSON.stringify([]));
      return;
    } else {
      if(rows.length > 0){
        res.end(JSON.stringify(rows));
      }else{
        res.end(JSON.stringify([]));
      }
    }
  });
});
// router.post('/getAllSwipper', checkLogin);
router.post('/getAllSwipper',function(req,res){
  var sql = 'select * from swipperdata where isdelete="no";';
  connection.query(sql, function(err, rows) {
    if (err) {
      console.log(err);
      res.end(JSON.stringify([]));
      return;
    } else {
      if(rows.length > 0){
        res.end(JSON.stringify(rows));
      }else{
        res.end(JSON.stringify([]));
      }
    }
  });
});
router.post('/getAllac',function(req,res){
  var sql = 'select * from acdata where isdelete="no";';
  connection.query(sql, function(err, rows) {
    if (err) {
      console.log(err);
      res.end(JSON.stringify([]));
      return;
    } else {
      if(rows.length > 0){
        res.end(JSON.stringify(rows));
      }else{
        res.end(JSON.stringify([]));
      }
    }
  });
});
//getAllRooms
router.get('/getAllRooms',function(req,res){
  var sql = 'select * from bodyroom where isdelete="no";';
  connection.query(sql, function(err, rows) {
    if (err) {
      console.log(err);
      res.end(JSON.stringify([]));
      return;
    } else {
      if(rows.length > 0){
        res.end(JSON.stringify(rows));
      }else{
        res.end(JSON.stringify([]));
      }
    }
  });
});
//getAllFoods
router.get('/getAllFoods',function(req,res){
  var sql = 'select * from bodyfood where isdelete="no";';
  connection.query(sql, function(err, rows) {
    if (err) {
      console.log(err);
      res.end(JSON.stringify([]));
      return;
    } else {
      if(rows.length > 0){
        res.end(JSON.stringify(rows));
      }else{
        res.end(JSON.stringify([]));
      }
    }
  });
});
//获取所有的食物
router.post('/getAllDongTai', checkLogin);
router.get('/getAllDongTai',function(req,res){
  var sql = 'select * from signtab where isdelete="no";';
  connection.query(sql, function(err, rows) {
    if (err) {
      console.log(err);
      res.end(JSON.stringify([]));
      return;
    } else {
      if(rows.length > 0){
        res.end(JSON.stringify(rows));
      }else{
        res.end(JSON.stringify([]));
      }
    }
  });
});
router.post('/deleteBodyRoom', checkLogin);
  router.post('/deleteBodyRoom', function(req, res) {
    var da;
    req.on('data', function(data) {
      da = data.toString();
    });
    req.on('end', function() {
      var y = 'yes';
      var sql = 'update bodyroom set isDelete="' + y + '"where id="' + da + '";';
      connection.query(sql, function(err, resupdate) {
        if (err) {
          console.log(err);
          res.end('update error');
          return;
        } else {
          // console.log(resupdate);
          res.end('删除成功');
          return;
        }
      });
    })
  });
  
  router.post('/getRoomSolo', function(req, res) {
    var da;
    req.on('data', function(data) {
      da = data.toString();
    });
    req.on('end', function() {
      var sql = 'select * from bodyroom where id="' + da + '";';
      connection.query(sql, function(err, rows) {
        if (err) {
          console.log(err);
          res.end(JSON.stringify([]));
          return;
        } else {
          if(rows.length > 0){
            res.end(JSON.stringify(rows));
          }else{
            res.end(JSON.stringify([]));
          }
        }
      });
    })
  });
  router.post('/getFoodSolo', function(req, res) {
    var da;
    req.on('data', function(data) {
      da = data.toString();
    });
    req.on('end', function() {
      var sql = 'select * from bodyfood where id="' + da + '";';
      connection.query(sql, function(err, rows) {
        if (err) {
          console.log(err);
          res.end(JSON.stringify([]));
          return;
        } else {
          if(rows.length > 0){
            res.end(JSON.stringify(rows));
          }else{
            res.end(JSON.stringify([]));
          }
        }
      });
    })
  });
  router.post('/deleteBodyFood', checkLogin);
  router.post('/deleteBodyFood', function(req, res) {
    var da;
    req.on('data', function(data) {
      da = data.toString();
    });
    req.on('end', function() {
      var y = 'yes';
      var sql = 'update bodyfood set isDelete="' + y + '"where id="' + da + '";';
      connection.query(sql, function(err, resupdate) {
        if (err) {
          console.log(err);
          res.end('update error');
          return;
        } else {
          // console.log(resupdate);
          res.end('删除成功');
          return;
        }
      });
    })
  });
  router.post('/deleteSwipper', checkLogin);
  router.post('/deleteSwipper', function(req, res) {
    var da;
    req.on('data', function(data) {
      da = data.toString();
    });
    req.on('end', function() {
      var y = 'yes';
      var sql = 'update swipperpics set isdelete="' + y + '"where id="' + da + '";';
      connection.query(sql, function(err, resupdate) {
        if (err) {
          console.log(err);
          res.end('update error');
          return;
        } else {
          // console.log(resupdate);
          res.end('删除成功');
          return;
        }
      });
    })
  });

  router.post('/deleteMsg', checkLogin);
  router.post('/deleteMsg', function(req, res) {
    var da;
    req.on('data', function(data) {
      da = data.toString();
    });
    req.on('end', function() {
      var y = 'yes';
      var sql = 'update systemmsg set isdelete="' + y + '"where id="' + da + '";';
      connection.query(sql, function(err, resupdate) {
        if (err) {
          console.log(err);
          res.end('update error');
          return;
        } else {
          // console.log(resupdate);
          res.end('删除成功');
          return;
        }
      });
    })
  });
  router.post('/deleteac', checkLogin);
  router.post('/deleteac', function(req, res) {
    var da;
    req.on('data', function(data) {
      da = data.toString();
    });
    req.on('end', function() {
      var y = 'yes';
      if(da.split("&")[1] == "yes"){
          y = 'no';
      }
      var sql = 'update userinfo set isfd="' + y + '"where id="' + da.split("&")[0] + '";';
      connection.query(sql, function(err, resupdate) {
        if (err) {
          console.log(err);
          res.end('update error');
          return;
        } else {
          // console.log(resupdate);
          res.end('操作成功');
          return;
        }
      });
    })
  });

  router.post('/deleteH', checkLogin);
  router.post('/deleteH', function(req, res) {
    var da;
    req.on('data', function(data) {
      da = data.toString();
    });
    req.on('end', function() {
      var y = 'yes';
      if(da.split("&")[1] == "yes"){
          y = 'no';
      }
      var sql = 'update housesets set isrelease="' + y + '"where id="' + da.split("&")[0] + '";';
      connection.query(sql, function(err, resupdate) {
        if (err) {
          console.log(err);
          res.end('update error');
          return;
        } else {
          // console.log(resupdate);
          res.end('操作成功');
          return;
        }
      });
    })
  });
   router.post('/deleteht', checkLogin);
  router.post('/deleteht', function(req, res) {
    var da;
    req.on('data', function(data) {
      da = data.toString();
    });
    req.on('end', function() {
      var y = da.split("&")[1];
      if(y=="yes"){
        y = "no";
      }else{
        y = "yes";
      }

      var id = da.split("&")[0];
      var sql = 'update htdata set isdelete="' + y + '"where id="' + id + '";';
      connection.query(sql, function(err, resupdate) {
        if (err) {
          console.log(err);
          res.end('update error');
          return;
        } else {
          // console.log(resupdate);
          res.end('操作成功');
          return;
        }
      });
    })
  });
  router.post('/deletepro', checkLogin);
  router.post('/deletepro', function(req, res) {
    var da;
    req.on('data', function(data) {
      da = data.toString();
    });
    req.on('end', function() {
      var y = 'yes';
      var sql = 'update prodata set isdelete="' + y + '"where id="' + da + '";';
      connection.query(sql, function(err, resupdate) {
        if (err) {
          console.log(err);
          res.end('update error');
          return;
        } else {
          // console.log(resupdate);
          res.end('删除成功');
          return;
        }
      });
    })
  });
  router.post('/deletep', checkLogin);
  router.post('/deletep', function(req, res) {
    var da;
    req.on('data', function(data) {
      da = data.toString();
    });
    req.on('end', function() {
      var y = 'yes';
      var sql = 'update ppd set isdelete="' + y + '"where id="' + da + '";';
      connection.query(sql, function(err, resupdate) {
        if (err) {
          console.log(err);
          res.end('update error');
          return;
        } else {
          // console.log(resupdate);
          res.end('删除成功');
          return;
        }
      });
    })
  });
  router.post('/deleteOrder', checkLogin);
  router.post('/deleteOrder', function(req, res) {
    var da;
    req.on('data', function(data) {
      da = data.toString();
    });
    req.on('end', function() {
      var y = 'yes';
      var sql = 'update orderlist set isover="' + y + '"where id="' + da + '";';
      connection.query(sql, function(err, resupdate) {
        if (err) {
          console.log(err);
          res.end('update error');
          return;
        } else {
          // console.log(resupdate);
          res.end('修改成功');
          return;
        }
      });
    })
  });
  router.post('/deleteOrderli', checkLogin);
  router.post('/deleteOrderli', function(req, res) {
    var da;
    req.on('data', function(data) {
      da = data.toString();
    });
    req.on('end', function() {
      var y = 'yes';
      var sql = 'update orderdata set isover="' + y + '"where id="' + da + '";';
      connection.query(sql, function(err, resupdate) {
        if (err) {
          console.log(err);
          res.end('update error');
          return;
        } else {
          // console.log(resupdate);
          res.end('修改成功');
          return;
        }
      });
    })
  });
  router.post('/deleteDongTai', checkLogin);
  router.post('/deleteDongTai', function(req, res) {
    var da;
    req.on('data', function(data) {
      da = data.toString();
    });
    req.on('end', function() {
      var y = 'yes';
      var sql = 'update signtab set isDelete="' + y + '"where id="' + da + '";';
      connection.query(sql, function(err, resupdate) {
        if (err) {
          console.log(err);
          res.end('update error');
          return;
        } else {
          // console.log(resupdate);
          res.end('删除成功');
          return;
        }
      });
    })
  });
  // APP用户API
//用户注册 我gao你gan
router.post('/userRe',function(req,res){
  console.log(req.body.name);
  var username = req.body.name;
  var md5 = crypto.createHash('md5');
  var pwd = md5.update(req.body.pwd).digest('hex');
  var sql = "insert into userinfo(nickname,pwd) values('" + username + "','" + pwd + "');";
      connection.query(sql, function(err, resInsert) {
        if (err) {
          console.log(err);
          res.end('failed');
          return;
        } else {
          res.end('success');
          return;
        }
      });
});
//用户登录
router.post('/userLo',function(req,res){
  var name = req.body.name;
  var md5 = crypto.createHash('md5');
  var pwd = md5.update(req.body.pwd).digest('hex');
  var sql = 'select * from userinfo where nickname="' + name + '"and pwd="'+pwd+'";';
      connection.query(sql, function(err, rows) {
        if (err) {
          console.log(err);
          res.end('failed');
          return;
        } else {
          if(rows.length > 0){
            var obj = 
              {
                "iss": "ninghao.net",
                "exp": "1438955445",
                "name": "wanghao",
                "admin": true
            }
            var tokenStr = token.createToken(obj,1800);
            console.log(tokenStr);
            res.end('success&'+rows[0].id+"&"+tokenStr);
          }else{
            res.end('not user');
          }
        }
      });
});
//用户下单
router.post('/userOrder',function(req,res){
  if(token.checkToken(req.body.token)){
    // res.end("token未过期");
    // return;
  }else{
    res.end("token已过期");
    return;
  }
  var isover = "no";
  var sql = "insert into orderdata(username,usertel,useraddr,userid,proid,isover,useremail) values('" + req.body.username + "','" + req.body.usertel + "','" + req.body.useraddr + "','" + req.body.userid + "','"  + req.body.proid + "','"  + isover + "','"  + req.body.useremail + "');";
      connection.query(sql, function(err, resInsert) {
        if (err) {
          console.log(err);
          res.end('order failed');
          return;
        } else {
          
          res.end('order success');
          return;
        }
      });
});
//token实用性检查
router.post('/testToken',function(req,res){
  if(token.checkToken(req.body.token)){
    // res.end("token未过期");
    // return;
  }else{
    res.end("token已过期");
    return;
  }
  var userId = String(req.body.userId);
  var acId = req.body.acId;
  var sql = 'select joinpeople from acdata where id="' + acId + '";';
      connection.query(sql, function(err, rows) {
        if (err) {
          console.log(err);
          res.end('error');
          return;
        } else {
          if(rows.length > 0){
            if(rows[0].joinpeople.indexOf(userId) == -1){
              var sql = 'update acdata set joinpeople=concat(joinpeople,"' + userId + '")where id="' + acId + '";';
      connection.query(sql, function(err, resupdate) {
        if (err) {
          console.log(err);
          res.end('update error');
          return;
        } else {
          // console.log(resupdate);
          res.end('update success');
          return;
        }
      });
            }else{
              res.end("already join");
            }
          }
        }
      });
  
});
//用户话题参加评论
//uploadmsg
router.post('/uploadmsg',function(req,res){
  if(token.checkToken(req.body.token)){
    // res.end("token未过期");
    // return;
  }else{
    res.end("token已过期");
    return;
  }
  var msg = req.body.msg+"&";
  // var msg = "sd"
              var sql = "update htdata set messages=concat(messages,'" + msg + "') where id='" + req.body.htId + "';";
      connection.query(sql, function(err, resupdate) {
        if (err) {
          console.log(err);
          res.end('update error');
          return;
        } else {
          // console.log(resupdate);
          res.end('update success');
          return;
        }
      });
  
});
//token实用性检查
router.post('/addht',function(req,res){
  if(token.checkToken(req.body.token)){
    // res.end("token未过期");
    // return;
  }else{
    res.end("token已过期");
    return;
  }
  var userId = String(req.body.userId);
  var acId = req.body.acId;
  var isrelease = "yes";
  var messages = "";
        var sql = "insert into htdata(name,hoster,hosterid,messages,isdelete) values('" + req.body.htname + "','" + req.body.username + "','" + req.body.userId + "','" + messages + "','" + isrelease + "');";
      connection.query(sql, function(err, resupdate) {
        if (err) {
          console.log(err);
          res.end('update error');
          return;
        } else {
          // console.log(resupdate);
          res.end('update success');
          return;
        }
      });
  
});
router.post('/finishInfo',function(req,res){
  if(token.checkToken(req.body.token)){
    // res.end("token未过期");
    // return;
  }else{
    res.end("token已过期");
    return;
  }
  var sql = 'update userinfo set email="' + req.body.email + '",tel="'+req.body.tel+'",address="'+req.body.addr+'"where id="' + req.body.userId + '";';
      connection.query(sql, function(err, resupdate) {
        if (err) {
          console.log(err);
          res.end('update error');
          return;
        } else {
          // console.log(resupdate);
          res.end('update success');
          return;
        }
      });
});
//用户获取 tel email addr信息
router.post('/getUserInfo',function(req,res){
  if(token.checkToken(req.body.token)){
    // res.end("token未过期");
    // return;
  }else{
    res.end("token已过期");
    return;
  }
  var sql = 'select * from userinfo where id="'+req.body.userId+'";';
  connection.query(sql, function(err, rows) {
    if (err) {
      console.log(err);
      res.end(JSON.stringify([]));
      return;
    } else {
      if(rows.length > 0){
        res.end(JSON.stringify(rows));
        return;
      }else{
        res.end(JSON.stringify([]));
        return;
      }
    }
  });
});
//List页面Token check
router.post('/ListToken',function(req,res){
  if(token.checkToken(req.body.token)){
    res.end("token未过期");
  }else{
    res.end("token已过期");
  }
});
//检查管理员是否登录
function checkLogin(req, res, next) {
  if (!req.session.user) {
    req.flash('error', '未登录,请您先登录！');
    return res.redirect('/admin/login');
  }
  next();
}

function checkNotLogin(req, res, next) {
  if (req.session.user){
    req.flash('error', '已登录!');
    return res.redirect('back');
  }
  next();
}

//检查用户是否登录
function checkUserLogin(req, res, next) {
  if (!req.session.normaluser) {
    req.flash('error', '未登录,请您先登录！');
    return res.redirect('/userLogin');
  }
  next();
}

function checkUserNotLogin(req, res, next) {
  if (req.session.normaluser){
    req.flash('error', '已登录!');
    return res.redirect('back');
  }
  next();
}
module.exports = router;
