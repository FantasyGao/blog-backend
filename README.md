
## 前后端分离实践----blog's backend
### 前端地址---- [blog's frontend](https://github.com/FantasyGao/blog-frontend.git)

#### 简介:通过vue.js框架与[koa2框架](https://github.com/FantasyGao/koa2.git)分别搭建前后端，利用ngnix端口分发部署实现代码全分离，开发全分离。

#### nginx文件配置内容
 ```
	server {
		listen       80;
		server_name  localhost;
		location / {
		    proxy_pass http://127.0.0.1:8080;               #转发非api，与上传的静态资源的其他信息 
		    proxy_redirect default;
		}
		location /api/ {
		    proxy_pass http://127.0.0.1:3000/api/;          #转发至api接口
		}
			location ^~ /uploads/ {
		    proxy_pass http://127.0.0.1:3000/uploads/;     #转发至上传的静态资源
		}
	}
 ```

#### Getting Start

##### 1. 开发环境
 ```
node.js 7.6+
mognodb 3.0+
```
##### 2. 依赖于mongodb数据库
       先安装 [mongodb](https://www.mongodb.com/) 数据库，安装完成后运行数据库，开启27017（默认）端口
##### 3. 克隆到本地，安装依赖，运行
```
> git clone https://github.com/FantasyGao/blog-backend.git
> cd blog-backend
> npm install 
> npm start
```
### 简要概述

#### 1. 全部使用ES6语法，aysnc+await结构
#### 2. 通过mongoose模块+promise模块操作mongodb数据库
#### 3. 由jsonwebtoken模块完成权限控制
#### 4. （可选）koa-sslify 模块，实现https，需要ssl证书和密钥
#### 5. koa-multer模块协助完成静态文件上传

### 目录结构

```
➜  backend
.
├── README.md
├── app.js
├── node_modules
├── package.json
├── public
│   ├── images
│   ├── dist
│   └── upoloads
├── ssl
│   ├── server.cert
│   └── server.key
├── db
│   ├── config.js
│   └── model.js
├── api
│   ├── articleAPI.js
├── ├── userAPI.js
│   └── logAPI.js
├── route
│   ├── api.js
├── ├── auth.js
│   └── other.js
└── views
    ├── err.ejs
    └── index.ejs

```

### License
MIT
