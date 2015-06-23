var CronJob    = require('cron').CronJob,
    cheerio    = require('cheerio'),
    nodemailer = require('nodemailer'),
    async      = require('async'),
    request    = require('request'),
    gbk        = require('gbk')

var job = new CronJob({
  cronTime: '00 30 07 * * 2,4,7',
  onTick: function() {
      async.waterfall([
          function(next) {
              getHTML(next);
          },
          function(body,next){
              parser(body,next)
          },
          function(html,next){
              getResult(html,next)
          }
      ], function (err, result) {
         sendMail(result)
      });
  },
  start: false,
  timeZone: 'Asia/ShangHai'
});

job.start();

function getHTML(next) {
    var options = {
        url: 'http://kaijiang.500.com/dlt.shtml',  
        encoding: null
    }
    request(options, function (error, response, body) {
          if (!error && response.statusCode == 200) {
            next(null, body)
          }
    })
}
function parser(body,next) { 
    var result = gbk.toString('utf-8', body)
    next(null, result)
}
function getResult(html,next) {
     var $ = cheerio.load(html,{decodeEntities: false})
     var table = $('table.kj_tablelist02')
     var series = $('.span_left',table).text()
     var number = $('.ball_box01 ul', table).text()
         number = number.replace(/\s+/g, ' ')
     next(null, {series:series, number:number})
}
function sendMail(content,next) {
  var smtpTransport = nodemailer.createTransport({
        service: "QQ",
        auth: {
            user: "YOUR QQ",
            pass: "YOUR QQ Password"
        }
    });

    //邮件选项设置
    var mailOptions = {
<<<<<<< HEAD
        from: "", // 发件人地址
        to: "", //多个收件人用,分隔
=======
        from: "xxx", // 发件人地址
        to: "zzz", //多个收件人用,分隔
>>>>>>> 18abdc757c4281696b9208577330c00e9e66ca28
        subject: content['series'], // 主题
        html: "<h1>" + content['number']+"</h1>"
    }

    //发送
    smtpTransport.sendMail(mailOptions, function(error, response){
        if(error){
            console.log(error);
        }else{
            console.log("Message sent ok");
        }
        smtpTransport.close();
    });
}
