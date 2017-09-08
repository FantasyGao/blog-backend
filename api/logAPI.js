const db = require('../db/model.js')
const logModel    = db.logAPI

/**
 * 返回值
 * @param code 返回码
 * @param msg	返回信息
 * @return
 */

var resObj = (code,msg,token) => {
    return {
        status: code,
        msg: msg,
        data:token
    }
}

/**
 *  日志信息  
 */
exports.LOGS_USER_API = async(ctx,next)=>{
    let getParams = ctx.request.query;
    let count = parseInt(getParams.count?getParams.count:0)
    let sortWay =  {time:getParams.time==1?getParams.time:-1}
    let name = getParams.name?{user:getParams.name}:{}
    await logModel.find(name).limit(count).sort(sortWay).exec()
        .then((data) => {
            let resData = {}
            let list = []
            resData.count = data.length
            data.forEach((item,i) => {
                let obj = {}
                obj.id = item._id
                obj.time = FormatDate(item.loginTime, 1)
                obj.massage = item.massage
                obj.ip = item.ip
                obj.user = item.user
                list.push(obj)
            })
            resData.list = list
            ctx.body = resObj(1,'查询成功',resData)    
        })
        .catch((e) => {
            console.log(e)
            ctx.body = resObj(0,'查询出错',e.toString())
        })
}
exports.DELETE_LOGS_USER_API = async(ctx,next)=>{
    let info = ctx.query.id
    await logModel.findByIdAndRemove(info).exec()
        .then((data) => {
            ctx.body = resObj(1,'删除成功')
        })
        .catch((e) => {
            console.log(e)
            ctx.body = resObj(0,'发生错误',e)
        })
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