
### Koa2 框架

### Getting Start

```
> git clone https://github.com/FantasyGao/koa2.git
> cd koa2
> npm install 
> npm start
```
### 说明
#### koa的中间件方式 await+async
``` javascript
app.use(async (ctx, next) => {
    ...
    await next();
    ...
});
```
#### 默认模板 ejs
``` javascript
app.use(view(__dirname+'/views',{
    extension: 'ejs'
});
```
#### https的访问方式
> ssl证书免费申请：（腾讯云）https://console.qcloud.com/ssl
``` javascript
let options = {
    key: fs.readFileSync(__dirname+'/ssl/server.key'),
    cert: fs.readFileSync(__dirname+'/ssl/server.crt')
};
https.createServer(options, app.callback()).listen(443,()=>{
    console.log("https://127.0.0.1:443 is runing");
    opener("https://127.0.0.1:443");
});
```

## 目录结构

```
➜  koa2
.
├── README.md
├── app.js
├── node_modules
│   ├── ejs
│   ├── koa
│   ├── koa-bodyparser
│   ├── koa-convert
│   ├── koa-logger
│   ├── koa-onerror
│   ├── koa-router
│   ├── koa-static
│   ├── koa-views
│   └── opener
├── package.json
├── public
│   ├── images
│   ├── javascripts
│   └── stylesheets
├── ssl
│   ├── server.cert
│   └── server.key
├── routes
│   ├── index.js
│   └── other.js
└── views
    ├── err.ejs
    └── index.ejs

```
