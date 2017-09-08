const Koa        = require('koa');
const bodyparser = require('koa-bodyparser');
const view       = require('koa-views');
const koaError   = require('koa-onerror');  
const convert    = require('koa-convert');
const koaStatic  = require('koa-static');
const logger     = require('koa-logger');
const http       = require('http');
const https      = require('https');
const fs         = require('fs');
const koaSslify  = require('koa-sslify');

const opener     = require('opener');

const app        = new Koa();

const index      = require('./route/index.js');
const other      = require('./route/other.js');
const api        = require('./route/api.js');


app.convert = x => app.use.call(app, convert(x));

app.convert(bodyparser());
//logger
app.convert(logger());

//static
app.convert(koaStatic(__dirname+'/public'));

//强制转用https
//app.convert(koaSslify());

//设置默认模板为ejs
app.use(view(__dirname+'/views',{
	extension: 'ejs'
}));

//发生默认err.ejs
koaError(app,{template: 'views/err.ejs'});
//router
app.use(index.routes(),index.allowedMethods());
app.use(other.routes(),other.allowedMethods());
app.use(api.routes(),api.allowedMethods());

// error logger
app.on('error',(err, ctx) => {
  console.log('error occured:', err)
});

let options = {
	key: fs.readFileSync(__dirname+'/ssl/server.key'),
    cert: fs.readFileSync(__dirname+'/ssl/server.crt')
};

http.createServer(app.callback()).listen(3000,()=>{
    console.log("http://127.0.0.1:3000 is runing");
	//opener("http://127.0.0.1:3000");
});
// https.createServer(options, app.callback()).listen(443,()=>{
//     console.log("https://127.0.0.1:443 is runing");
// 	//opener("https://127.0.0.1:443");
// });