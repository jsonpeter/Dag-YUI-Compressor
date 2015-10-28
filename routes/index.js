var express = require('express');
var fs = require('fs');
var formidable = require('formidable');
var router = express.Router();
var compressor = require('yuicompressor');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.sendfile("./views/tools.html");
});

router.post('/', function(req, res, next) {
  var form = new formidable.IncomingForm();   //创建上传表单
  form.uploadDir= "public/tmp/";//上传目录
  form.parse(req, function(err, fields, files) {
    var extName = '';  //后缀名
    var myfiles=files.codecsv;
     console.log(myfiles.type);
    switch (myfiles.type) {
      case 'application/javascript':
        extName = 'js';
        break;
      case 'text/css':
        extName = 'css';
        break;
    }
    if(extName.length == 0){
      res.send({"status":"1","msg":"只支持css和js格式文件"});
      return;
    }
    var newFilerName=myfiles.name.substr(0, myfiles.name.lastIndexOf('.'))+"."+extName;

    var newPath = form.uploadDir + newFilerName;
    fs.renameSync(myfiles.path, newPath);  //重命名
    fs.readFile(newPath,"utf8",function (error,data){
      ////压缩
      compressor.compress(data, {
        charset: 'utf8',
        type: extName
      }, function (err, data, extra) {
        fs.writeFile(form.uploadDir+"output/"+newFilerName, data, function(){
          if(extra.length>0)
          {
            res.send({"status":"-1","msg":"压缩失败，请检查语法是否有误！","err":err});
          }else{
            res.send({"status":"0","msg":"压缩成功！","source":"tmp/output/"+newFilerName});
          }

        });
      });
    });

  });
});
module.exports = router;
