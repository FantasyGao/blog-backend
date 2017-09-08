const jwt = require('jsonwebtoken')
const secret = 'mynameisFantasyGao'; // 指定密钥，这是之后用来判断 token 合法性的标志

const db = require('../db/model.js')
const UserModel    = db.userAPI
const LogModel    = db.logAPI
const concernedUser    = db.concernedAPI

/**
 * 返回值
 * @param code 返回码
 * @param msg	返回信息
 * @return
 */

var resObj = (code,msg,token,resData) => {
    return {
        status: code,
        msg: msg,
        token:token,
        data:resData
    }
}

var logObj = (user,ip,msg) => {
    return {
        user: user,
        ip: ip,
        massage:msg
    }
}
/**
 *  用户信息  
 */
exports.USER_REGISTER_API = async(ctx,next)=>{
    var addInfo = ctx.request.query
    if (!addInfo.user||!addInfo.password) {
        ctx.status = 200
        ctx.body = resObj(-1,'参数不全')
        return
    }
    let userObj = {}
    userObj.user = addInfo.user
    let userIp = ctx.request.ip.match(/\d+.\d+.\d+.\d+/)[0]
    let logInfo = logObj(addInfo.user,userIp,"注册账号")
    try {
        await UserModel.find(userObj).exec()
            .then((data) => {
                if (data.length !== 0) {
                    ctx.body = resObj(2,'用户名已存在')
                } else {
                    addInfo.token = jwt.sign({
                        user_id: addInfo.user,
                        }, secret, {
                        expiresIn: '12h' //那么decode这个token的时候得到的过期时间为 : 创建token的时间 +　设置的值
                    })
                    let addUser = new UserModel(addInfo)
                    addUser.save()
                    // 日志服务
                    let logRegister = new LogModel(logInfo)
                    logRegister.save()
                    ctx.status = 200
                    ctx.body = resObj(1,'注册成功')
                }
            })
            .catch((e) => {
                ctx.body = resObj(0,'发生错误',e.toString())
            })
        } catch(e) {
            ctx.body = resObj(0,'数据库错误',e.toString())
        }
}
// login
exports.USER_LOGIN_API = async(ctx,next)=>{
    let Info = ctx.request.query
    console.log(Info)
    if (!Info.user||!Info.password) {
        ctx.status = 200
        ctx.body = resObj(-1,'参数不全')
        return
    }
    let userObj = {}
    userObj.user = Info.user
    let userIp = ctx.request.ip.match(/\d+.\d+.\d+.\d+/)[0]
    let logInfo = logObj(Info.user,userIp,"登录系统")
    try {
        await UserModel.find(userObj).exec()
            .then((data) => {
                if (data.length == 1) {
                    if(data[0].password==Info.password){
                         // 日志服务
                        let logRegister = new LogModel(logInfo)
                        logRegister.save()
                        const token = jwt.sign({
                            user_id: data[0]._id,
                            }, secret, {
                            expiresIn: '12h' //过期时间设置为60妙。那么decode这个token的时候得到的过期时间为 : 创建token的时间 +　设置的值
                        });
                        userObj.password = Info.password
                        UserModel.findOneAndUpdate(userObj,{token: token}).exec()
                        ctx.body = resObj(1,'登录成功',token)
                    } else{
                        ctx.body = resObj(2,'密码错误')
                    }
                } else {
                    ctx.body = resObj(2,'不存在用户名')
                }
            })
            .catch((e) => {
                ctx.body = resObj(0,'发生错误',e.toString())
            })
    } catch(e) {
        ctx.body = resObj(0,'数据库错误',e.toString())
    }
}
// update
exports.USER_UPDATA_PASSWORD_API = async(ctx,next)=>{
    let Info = ctx.request.query
    if (!Info.user||!Info.password||!Info.Oldpassword) {
        ctx.status = 200
        ctx.body = resObj(-1,'参数不全')
        return
    }
    let userObj = new Object()
    userObj.user = Info.user
    userObj.password = Info.password
    Info.password = Info.passwordOld
    delete Info.passwordOld
    let userIp = ctx.request.ip.match(/\d+.\d+.\d+.\d+/)[0]
    let logInfo = logObj(Info.user,userIp,"修改密码")
    try {
        var data = await UserModel.find(userObj).exec()
        if (data.length !== 0) {
            await UserModel.findOneAndUpdate(userObj,Info).exec()
            .then((data) => {
                // 日志服务
                let logRegister = new LogModel(logInfo)
                logRegister.save()
                ctx.body = resObj(1,'修改成功')
            })
            .catch((e) => {
                console.log(e)
                ctx.body = resObj(0,'发生错误',e)
            })
        } else {
            ctx.body = resObj(2,'不存在该用户')
        }
    } catch(e) {
        ctx.body = resObj(0,'数据库错误',e.toString())
    }
}
// print_users
exports.USER_PRINT_API = async(ctx,next)=>{
    let getParams = ctx.request.query;
    try{
        let data = await printUser(getParams)
        let result = {}
        let resData = []
        data.data.forEach((item,i) => {
            let obj = {}
            obj.id = item._id
            obj.time = FormatDate(item.joinTime,1)
            obj.user = item.user
            obj.email = item.email
            obj.remark = item.remark
            resData.push(obj)
        })
        result.count = data.length
        result.list = resData
        ctx.body = resObj(1,'查询成功','',result)
    }
    catch(e) {
        console.log(e)
        ctx.body = resObj(0,'查询出错',e.toString())
    }
}
// delete_user
exports.USER_DETELE_API = async(ctx,next)=>{
    let getParams = ctx.request.query;
    if (!getParams.id) {
        ctx.status = 200
        ctx.body = resObj(-1,'参数不全')
        return
    }
    try {
        await UserModel.findByIdAndRemove(getParams.id).exec()
        .then((data) => {
            ctx.body = resObj(1,'删除成功')
        })
        .catch((e) => {
            console.log(e)
            ctx.body = resObj(0,'发生错误',e)
        })
    } catch(e) {
        ctx.body = resObj(0,'数据库错误',e.toString())
    }
}
// PRINT_CONCERNEDUSER_API
exports.PRINT_CONCERNEDUSER_API = async(ctx,next)=>{
    let getParams = ctx.query
    try {
        let search = {}
        if(getParams.user){
            search.user = getParams.user
        }
        await concernedUser.find(search).exec()
        .then((data) => {
            let resData = {
                count: data.length,
                list:data
            }
            ctx.body = resObj(1,'查询成功','',resData)
        })
        .catch((e) => {
            ctx.body = resObj(0,'发生错误','',e.toString())
        })
    } catch(e) {
        ctx.body = resObj(0,'数据库错误','',e.toString())
    }
}
// delete_user
exports.DELETE_CONCERNEDUSER_API = async(ctx,next)=>{
    let getParams = ctx.request.query;
    if (!getParams.id) {
        ctx.status = 200
        ctx.body = resObj(-1,'参数不全')
        return
    }
    try {
        await concernedUser.findByIdAndRemove(getParams.id).exec()
        .then((data) => {
            ctx.body = resObj(1,'删除成功')
        })
        .catch((e) => {
            console.log(e)
            ctx.body = resObj(0,'发生错误',e)
        })
    } catch(e) {
        ctx.body = resObj(0,'数据库错误',e.toString())
    }
}
// edit_remark
exports.EDIT_REMARK_API = async(ctx,next)=>{
    let getParams = ctx.request.query;
    if (!getParams.id) {
        ctx.status = 200
        ctx.body = resObj(-1,'参数不全')
        return
    }
    let userObj = new Object()
    userObj.remark = getParams.remark
    try {
        await UserModel.findByIdAndUpdate(getParams.id,userObj).exec()
        .then((data) => {
            ctx.body = resObj(1,'修改备注成功')
        })
        .catch((e) => {
            console.log(e)
            ctx.body = resObj(0,'发生错误',e)
        })
    } catch(e) {
        ctx.body = resObj(0,'数据库错误',e.toString())
    }
}
const printUser = async (info) => {
    let count = parseInt(info.pageNum?info.pageNum:0)
    // 分页
    let skipNum
    if (info.pageNum&&info.page) {
        skipNum = (info.page-1)*info.pageNum
    }
    // 排序
    let sortWay
    if (info.time) {
        sortWay =  {time:info.time} 
    } else{
        sortWay = {time:-1} 
    }
    let searchInfo = {}
    if (info.name) {
        searchInfo.user = info.name
    }
    if (info.email) {
        searchInfo.email = info.email
    }
    if (info.remark) {
        searchInfo.remark = info.remark
    }
    let length = await UserModel.find(searchInfo).count()
    let data = await UserModel.find(searchInfo).limit(count).skip(skipNum).sort(sortWay).exec()
    return {
        length: length,
        data: data
    }
}
// 格式化时间
const FormatDate = (strTime,type) => {
    var date = new Date(strTime);
    if (type == 1){
        return date.Format("yyyy-MM-dd hh:mm:ss")
    } else {
        return date.Format("yyyy-MM-dd")
    }
}
Date.prototype.Format = function (fmt) { 
    var o = {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "h+": this.getHours(), //小时 
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}