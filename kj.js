var waterfall   = require('async').waterfall;
var iconv = require('iconv-lite');
var request = require('request');
var cheerio = require('cheerio');
var nodemailer = require('nodemailer');
var CronJob = require('cron').CronJob;

var App = {
    form: process.env.app_form,
    to:process.env.app_to,
    user:process.env.app_user,
    pass:process.env.app_pass,
}

var url = 'http://kaijiang.500.com/dlt.shtml';

var job = new CronJob({
  cronTime: '00 30 07 * * 2,4,7',
  onTick: function() {
    app();
  },
  start: false,
  timeZone: 'Asia/ShangHai'
});

job.start();

var app = function(){
	waterfall([
		function(cb) {
            getHTML(cb)
        },
		function(body,cb){
            parser(body,cb)
        },
		function(html,cb){
            getResult(html,cb)
        },
		function(result){
			sendMail(result)
		}
	])
}

function getHTML(cb){
	var options = {
        url: url,
        encoding: null
    }

	request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            cb(null, body)
        }
    })
}
function parser(body,cb){
	var result = iconv.decode(body, 'GBK');
	cb(null, result)
}
function getResult(html,cb) {
     var $ = cheerio.load(html,{decodeEntities: false});
     var table = $('table.kj_tablelist02');
     var series = $('.span_left',table).text();
     var number = $('.ball_box01 ul', table).text();
         number = number.replace(/\s+/g, ' ');
         number = number.trim().split(' ');
         number.splice(5,0,'-');
         number = number.join(' ');
     cb(null, {series:series, number:number})
}
function sendMail(content) {
  var smtpTransport = nodemailer.createTransport({
        service: "QQ",
        auth: {
            user: App.user,
            pass: App.pass
        }
    });

    var mailOptions = {
        from: App.form,
        to: App.to,
        subject: content['series'],
        html: "<h1>" + content['number']+"</h1>"
    }

    smtpTransport.sendMail(mailOptions, function(error, response){
        if(error){
            console.log(error);
        }else{
            console.log('ok!');
        }
        smtpTransport.close();
    });
}
module.exports = app