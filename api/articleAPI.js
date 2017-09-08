
const db = require('../db/model.js')
const ArticleModel    = db.articleAPI
const ConcernedModel    = db.concernedAPI
const siteReadingModel    = db.siteReadingAPI
const mongoose    = require('mongoose')
const fs = require('fs')


/**
 * 返回值
 * @param code 返回码
 * @param msg	返回信息
 * @param data 返回数据
 * @return
 */

var resObj = (code,msg,data) => {
    return {
        status: code,
        msg: msg,
        data: data
    }
}

/**
 *  文章信息  
 */
// add
exports.ADD_ARTICLE_INFO_API = async(ctx,next)=>{
    try {
        let addInfo = ctx.request.body
        addData = new ArticleModel(addInfo)
        var data = await addData.save()
        ctx.body = resObj(1,'保存成功',data)
    } catch (e){
        ctx.body = resObj(0,'保存出错',e.toString())
    }
}
// EDIT
exports.EDIT_ARTICLE_INFO_API = async(ctx,next)=>{
    let addInfo = ctx.request.body
    let Info = ctx.request.body.id
    try {
        let data = await ArticleModel.findByIdAndUpdate(Info,addInfo).exec()
        if(data){
            ctx.body = resObj(1,'保存成功',data)
        } else{
            ctx.body = resObj(2,'文章不存在')
        }
    } catch (e){
        ctx.body = resObj(0,'保存出错',e.toString())
    }
}
// 删除文章
exports.DELETE_ARTICLE_INFO_API = async(ctx,next)=>{
    let getParams = ctx.request.query
    try {
        let data = await ArticleModel.findByIdAndRemove(getParams.id).exec()
        if(data){
            ctx.body = resObj(1,'删除文章成功',data)
        } else{
            ctx.body = resObj(2,'文章不存在')
        }
    } catch(e) {
        console.log(e)
         ctx.body = resObj(0,'删除文章出错',e.toString())
    }
}
// search_all
exports.SEARCH_ARTICLE_INFO_API = async(ctx,next)=>{
    let getParams = ctx.request.query
    try {
        let data = await searchArticle(getParams)
        let result = {}
        let resData = []
        data.data.forEach((item,i) => {
            let obj = {}
            obj.id = item._id
            obj.title = item.title
            obj.time = FormatDate(item.time,1)
            obj.author = item.author
            obj.imageUrl = item.imageUrl
            obj.classic = item.classic
            obj.show = item.show
            obj.pv = item.pv
            obj.markNum = item.markNum
            obj.tags = ''
            item.tag.forEach((tagItem,j) => {
                obj.tags = obj.tags + tagItem.tagName
            })
            resData.push(obj)
        })
        result.count = data.length
        result.list = resData
        ctx.body = resObj(1,'查询成功',result)
    } catch (e){
        ctx.body = resObj(0,'查询出错',e.toString())
    }
}
// search_marks
exports.SEARCH_MARKS_INFO_API = async(ctx,next)=>{
    let getParams = ctx.request.query
    try {
        let data = await searchMarks(getParams)
        let result = {}
        let resData = []
        data.forEach((item,i) => {
            if (item.markList.length > 0) {
                if(!getParams.markUser){
                    item.markList.forEach((markItem,j) => {
                        let obj = {}
                        obj.id = item._id
                        obj.title = item.title
                        obj.time = FormatDate(item.time,1)
                        obj.author = item.classic
                        obj.classic = item.classic
                        obj.show = item.show
                        obj.markId = markItem._id
                        obj.markUser = markItem.userName
                        obj.userEmail = markItem.userEmail
                        obj.markShow = markItem.markShow
                        obj.markTime = FormatDate(markItem.markTime,1)
                        obj.likeNum = markItem.likeNum
                        resData.push(obj)
                    })
                 } else {
                    item.markList.forEach((markItem,j) => {
                        if(markItem.userName == getParams.markUser){
                            let obj = {}
                            obj.id = item._id
                            obj.title = item.title
                            obj.time = FormatDate(item.time,1)
                            obj.author = item.classic
                            obj.classic = item.classic
                            obj.show = item.show
                            obj.markId = markItem._id
                            obj.markUser = markItem.userName
                            obj.userEmail = markItem.userEmail
                            obj.markShow = markItem.markShow
                            obj.markTime = FormatDate(markItem.markTime,1)
                            obj.likeNum = markItem.likeNum
                            resData.push(obj)
                        }
                    })
                }
            }
        })
        result.count = resData.length
        result.list = resData
        ctx.body = resObj(1,'查询成功',result)
    } catch (e){
        ctx.body = resObj(0,'查询出错',e.toString())
    }
}
// edit_marks_show
exports.EDIT_MARKS_SHOW_API = async(ctx,next)=>{
    let getParams = ctx.request.query
    let info = getParams.id
    if(!info) {
        ctx.body = resObj(-1,'参数不全')
        return 
    }
    try {
        let marks = await ArticleModel.findById(info).exec()
        marks.markList.forEach((item,i)=>{
            if(item._id == getParams.markId) {
                marks.markList[i].markShow =  getParams.show
            }
        })
        await ArticleModel.findByIdAndUpdate(info,{markList:marks.markList}).exec()
            .then((data) => {
                ctx.status =200
                if(data){
                    ctx.body = resObj(1,'修改成功',data)
                } else {
                    ctx.body = resObj(2,'不存在项')
                }
            })
            .catch((e) => {
                ctx.status =200
                ctx.body = resObj(0,'修改出错',e.toString())
            })
    } catch(e){
        ctx.status =200
        ctx.body = resObj(-1,'数据库错误',e.toString())
    }
}
// search_show
exports.SEARCH_SHOW_ARTICLE_INFO_API = async(ctx,next)=>{
    let getParams = ctx.request.query
    try {
        let data = await searchArticleForUser(getParams)
        ctx.body = resObj(1,'查询成功',data)
    } catch (e){
        ctx.body = resObj(0,'查询出错',e.toString())
    }
}

// add_mark
exports.ADD_MARK_INFO_API = async(ctx,next)=>{
    let getParams = ctx.request.body
    let info = getParams.id
    let markObj = {}
    markObj.userName = getParams.user
    markObj.userEmail = getParams.email
    markObj.markContent = getParams.markContent
    try {
        await ArticleModel.findById(info).exec()
            .then((data) => {
                console.log(data)
                if(data){
                    data.markNum =  data.markNum + 1   // 评论总数
                    data.markList.push(markObj)
                    let addData = new ArticleModel(data)
                    addData.save()
                    ctx.body = resObj(1,'评论成功',data)
                } else {
                    ctx.body = resObj(2,'没有查找到文章')
                }
            })
            .catch((e) => {
                ctx.status =200
                ctx.body = resObj(0,'评论出错',e.toString())
            })
    } catch(e){
        ctx.status =200
        ctx.body = resObj(-1,'数据库错误',e.toString())
    }
}
// delete_mark
exports.DETELE_MARK_INFO_API = async(ctx,next)=>{
    let getParams = ctx.request.query
    let info = getParams.id
    let markId = getParams.markId
    try {
        await ArticleModel.findById(info).exec()
            .then((data) => {
                ctx.status =200
                if(data){
                    data.markList.forEach((item,i) => {
                        if (item._id == markId) {
                            data.markList.splice(i,i+1)
                        }
                    })
                    let addData = new ArticleModel(data)
                    addData.save()
                }
                ctx.body = resObj(1,'删除回复成功',data)
            })
            .catch((e) => {
                ctx.status =200
                ctx.body = resObj(0,'删除回复出错',e.toString())
            })
    } catch(e){
        ctx.status =200
        ctx.body = resObj(-1,'数据库错误',e.toString())
    }
}
// add_reply
exports.ADD_REPLY_INFO_API = async(ctx,next)=>{
    let getParams = ctx.request.body
    console.log(getParams)
    let info = getParams.id
    let markId = getParams.markId
    let replyObj = {}
    replyObj.replyName = getParams.user
    replyObj.replyEmail = getParams.email
    replyObj.replyedUser = getParams.replyedUser
    replyObj.replyContent = getParams.replyContent
    try {
        await ArticleModel.findById(info).exec()
            .then((data) => {
                ctx.status =200
                console.log(data)
                if(data){
                    data.markList.forEach((item,i) => {
                        if (item._id == markId) {
                            data.markList[i].replyList.push(replyObj)
                        }
                    })
                    let addData = new ArticleModel(data)
                    addData.save()
                    ctx.body = resObj(1,'回复成功',data)
                } else {
                    ctx.body = resObj(2,'评论不存在')
                }
            })
            .catch((e) => {
                ctx.status =200
                ctx.body = resObj(0,'回复出错',e.toString())
            })
    } catch(e){
        ctx.status =200
        ctx.body = resObj(-1,'数据库错误',e.toString())
    }
}
// delete_reply
exports.DETELE_REPLY_INFO_API = async(ctx,next)=>{
    let getParams = ctx.request.query
    let info = getParams.id
    let markId = getParams.markId
    let replyId = getParams.replyId
    try {
        await ArticleModel.findById(info).exec()
            .then((data) => {
                ctx.status =200
                if(data){
                    data.markList.forEach((item,i) => {
                        if (item._id == markId) {
                            data.markList[i].replyList.forEach((reply,j) => {
                                if(reply._id == replyId){
                                    data.markList[i].replyList.splice(j,j+1)
                                }
                            })
                        }
                    })
                    let addData = new ArticleModel(data)
                    addData.save()
                }
                ctx.body = resObj(1,'删除回复成功',data)
            })
            .catch((e) => {
                ctx.status =200
                ctx.body = resObj(0,'删除回复出错',e.toString())
            })
    } catch(e){
        ctx.status =200
        ctx.body = resObj(-1,'数据库错误',e.toString())
    }
}
// search_replys
exports.SEARCH_REPLYS_INFO_API = async(ctx,next)=>{
    let getParams = ctx.request.query
    try {
        let data = await searchMarks(getParams)
        let result = {}
        let resData = []
        data.forEach((item,i) => {
            if (item.markList.length > 0) {
                if(!getParams.markUser){
                    item.markList.forEach((markItem,j) => {
                        if(!getParams.replyUser){
                            markItem.replyList.forEach((replyItem,j) => {
                                let obj = {}
                                obj.id = item._id
                                obj.title = item.title
                                obj.time = FormatDate(item.time,1)
                                obj.show = item.show
                                obj.markId = markItem._id
                                obj.markUser = markItem.userName
                                obj.markShow = markItem.markShow
                                obj.markTime = FormatDate(markItem.markTime,1)
                                obj.replyUser = replyItem.replyName
                                obj.replyId = replyItem._id
                                obj.replyTime = FormatDate(replyItem.replyTime,1)
                                obj.replyShow = replyItem.replyShow
                                resData.push(obj)
                            })
                        } else {
                            markItem.replyList.forEach((replyItem,j) => {
                                if(replyItem.replyName == getParams.replyUser){
                                    let obj = {}
                                    obj.id = item._id
                                    obj.title = item.title
                                    obj.time = FormatDate(item.time,1)
                                    obj.show = item.show
                                    obj.markId = markItem._id
                                    obj.markUser = markItem.userName
                                    obj.markShow = markItem.markShow
                                    obj.markTime = FormatDate(markItem.markTime,1)
                                    obj.replyUser = replyItem.replyName
                                    obj.replyId = replyItem._id
                                    obj.replyTime = FormatDate(replyItem.replyTime,1)
                                    obj.replyShow = replyItem.replyShow
                                    resData.push(obj)
                                }
                            }) 
                        }
                    })
                 } else {
                    item.markList.forEach((markItem,j) => {
                        if(markItem.userName == getParams.markUser){
                            if(!getParams.replyUser){
                                markItem.replyList.forEach((replyItem,j) => {
                                    let obj = {}
                                    obj.id = item._id
                                    obj.title = item.title
                                    obj.time = FormatDate(item.time,1)
                                    obj.show = item.show
                                    obj.markId = markItem._id
                                    obj.markUser = markItem.userName
                                    obj.markShow = markItem.markShow
                                    obj.markTime = FormatDate(markItem.markTime,1)
                                    obj.replyUser = replyItem.replyName
                                    obj.replyId = replyItem._id
                                    obj.replyTime = FormatDate(replyItem.replyTime,1)
                                    obj.replyShow = replyItem.replyShow
                                    resData.push(obj)
                                })
                            } else {
                                markItem.replyList.forEach((replyItem,j) => {
                                    if(replyItem.userName == getParams.replyUser){
                                        let obj = {}
                                        obj.id = item._id
                                        obj.title = item.title
                                        obj.time = FormatDate(item.time,1)
                                        obj.show = item.show
                                        obj.markId = markItem._id
                                        obj.markUser = markItem.userName
                                        obj.markShow = markItem.markShow
                                        obj.markTime = FormatDate(markItem.markTime,1)
                                        obj.replyUser = replyItem.replyName
                                        obj.replyId = replyItem._id
                                        obj.replyTime = FormatDate(replyItem.replyTime,1)
                                        obj.replyShow = replyItem.replyShow
                                        resData.push(obj)
                                    }
                                }) 
                            }   
                        }
                    })
                }
            }
        })
        result.count = resData.length
        result.list = resData
        ctx.body = resObj(1,'查询成功',result)
    } catch (e){
        ctx.body = resObj(0,'查询出错',e.toString())
    }
}
// edit_reply_show
exports.EDIT_REPLYS_SHOW_API = async(ctx,next)=>{
    let getParams = ctx.request.query
    let info = getParams.id
    if(!info) {
        ctx.body = resObj(-1,'参数不全')
        return 
    }
    try {
        let marks = await ArticleModel.findById(info).exec()
        marks.markList.forEach((item,i)=>{
            if(item._id == getParams.markId) {
                marks.markList[i].replyList.forEach((replyItem,j) => {
                    if(replyItem._id == getParams.replyId){
                        marks.markList[i].replyList[j].replyShow  =  getParams.show
                    }
                })
            }
        })
        await ArticleModel.findByIdAndUpdate(info,{markList:marks.markList}).exec()
            .then((data) => {
                ctx.status =200
                if(data){
                    ctx.body = resObj(1,'修改成功',data)
                } else {
                    ctx.body = resObj(2,'不存在项')
                }
            })
            .catch((e) => {
                ctx.status =200
                ctx.body = resObj(0,'修改出错',e.toString())
            })
    } catch(e){
        ctx.status =200
        ctx.body = resObj(-1,'数据库错误',e.toString())
    }
}
// search_markers
exports.SEARCH_MARKERS_INFO_API = async(ctx,next)=>{
    let getParams = ctx.request.query
    try {
        let allData = await ArticleModel.find().exec()
        let allUser = []
        for(let i=0;i<allData.length;i++){
            for(let j=0;j<allData[i].markList.length;j++){
                if(!getParams.markUser){
                    let obj ={}
                    obj.id = allData[i]._id
                    obj.title = allData[i].title
                    obj.show = allData[i].show
                    obj.markUser = allData[i].markList[j].userName
                    obj.markShow = allData[i].markList[j].markShow
                    obj.markTime = allData[i].markList[j].markTime
                    obj.userEmail = allData[i].markList[j].userEmail
                    obj.markContent = allData[i].markList[j].markContent
                    obj.likeNum = allData[i].markList[j].likeNum
                    let user = await  ConcernedModel.find({user:obj.markUser}).exec()
                    if(user.length==0){
                        obj.attention = 0
                    } else {
                        obj.attention = 1
                    }
                    allUser.push(obj)
                } else if (getParams.markUser == allData[i].markList[j].userName){
                    let obj ={}
                    obj.id = allData[i]._id
                    obj.title = allData[i].title
                    obj.show = allData[i].show
                    obj.markUser = allData[i].markList[j].userName
                    obj.markShow = allData[i].markList[j].markShow
                    obj.markTime = allData[i].markList[j].markTime
                    obj.userEmail = allData[i].markList[j].userEmail
                    obj.markContent = allData[i].markList[j].markContent
                    obj.likeNum = allData[i].markList[j].likeNum
                    let user = await  ConcernedModel.find({user:obj.markUser}).exec()
                    if(user.length==0){
                        obj.attention = 0
                    } else {
                        obj.attention = 1
                    }
                    allUser.push(obj)
                }
            } 

        }
        let resData = {
            count:allUser.length,
            list:allUser
        }
        ctx.body = resObj(1,'查找成功',resData)
    } catch(e){
        ctx.status =200
        ctx.body = resObj(-1,'数据库错误',e.toString())
    }
}
// add_markers_attion
exports.ADD_ATTIENTION_INFO_API = async(ctx,next)=>{
    let getParams = ctx.request.body
    let info = getParams.id
    if(!info) {
        ctx.body = resObj(-1,'参数不全')
        return 
    }
    try {
        let data = await ArticleModel.findById(info).exec()
        let marks = data.markList
        let userName = {}
        userName.user = getParams.user
        let user =await  ConcernedModel.find(userName).exec()
        if(user.length==0){
            let obj = new ConcernedModel(getParams)
            console.log(obj)
            await obj.save()
            ctx.body = resObj(1,'添加成功')
        } else {
            console.log(userName)
            await ConcernedModel.findOneAndRemove(userName).exec()
            ctx.body = resObj(1,'移除成功')
        }
    } catch(e){
        ctx.status =200
        ctx.body = resObj(-1,'数据库错误',e.toString())
    }
}
// search_replys
exports.SEARCH_REPLYERS_INFO_API = async(ctx,next)=>{
    let getParams = ctx.request.query
    try {
        let allData = await ArticleModel.find().exec()
        let allUser = []
        for(let i=0;i<allData.length;i++){
            for(let j=0;j<allData[i].markList.length;j++){
                for(let k=0;k<allData[i].markList[j].replyList.length;k++){
                    
                    let obj ={}
                    obj.id = allData[i]._id
                    
                    obj.title = allData[i].title
                    obj.show = allData[i].show
                    obj.markUser = allData[i].markList[j].userName
                    obj.markShow = allData[i].markList[j].markShow
                    obj.markTime = allData[i].markList[j].markTime 
                    obj.replyUser = allData[i].markList[j].replyList[k].replyName
                    obj.replyTime = allData[i].markList[j].replyList[k].replyTime
                    obj.replyShow = allData[i].markList[j].replyList[k].replyShow
                    obj.replyContent = allData[i].markList[j].replyList[k].replyContent
                    let user = await  ConcernedModel.find({user:obj.replyUser}).exec()
                    if(user.length==0){
                        obj.attention = 0
                    } else {
                        obj.attention = 1
                    }
                    allUser.push(obj)
                }
            }
        }
        let resData = {
            count:allUser.length,
            list:allUser
        }
        ctx.body = resObj(1,'查找成功',resData)
    } catch(e){
        ctx.status =200
        ctx.body = resObj(-1,'数据库错误',e.toString())
    }
}
// add_markers_attion
exports.ADD_ATTIENTION_INFO_API = async(ctx,next)=>{
    let getParams = ctx.request.body
    let info = getParams.id
    if(!info) {
        ctx.body = resObj(-1,'参数不全')
        return 
    }
    try {
        let data = await ArticleModel.findById(info).exec()
        let marks = data.markList
        let userName = {}
        userName.user = getParams.user
        let user =await  ConcernedModel.find(userName).exec()
        if(user.length==0){
            let obj = new ConcernedModel(getParams)
            await obj.save()
            ctx.body = resObj(1,'添加成功')
        } else {
            await ConcernedModel.findOneAndRemove(userName).exec()
            ctx.body = resObj(1,'移除成功')
        }
    } catch(e){
        ctx.status =200
        ctx.body = resObj(-1,'数据库错误',e.toString())
    }
}
// add_LIKE
exports.ADD_LIKE_INFO_API = async(ctx,next)=>{
    let getParams = ctx.request.query
    let info = getParams.id
    let markId = getParams.markId
    try {
        await ArticleModel.findById(info).exec()
            .then((data) => {
                ctx.status =200
                if(data){
                    data.markList.forEach((item,i) => {
                        if (item._id == markId) {
                            let pos = data.markList[i].like.indexOf(getParams.user)
                            if(pos != -1){
                                data.markList[i].like.splice(pos,pos+1)
                                data.markList[i].likeNum--
                            }else{
                                data.markList[i].like.push(getParams.user)
                                data.markList[i].likeNum++
                            }
                        }
                    })
                    let addData = new ArticleModel(data)
                    addData.save()
                }
                ctx.body = resObj(1,'点赞成功',data)
            })
            .catch((e) => {
                ctx.status =200
                ctx.body = resObj(0,'点赞出错',e.toString())
            })
    } catch(e){
        ctx.status =200
        ctx.body = resObj(-1,'数据库错误',e.toString())
    }
}
// edit_show
exports.EDIT_SHOW_INFO_API = async(ctx,next)=>{
    let getParams = ctx.request.query
    let info = getParams.id
    if(!info) {
        ctx.body = resObj(-1,'参数不全')
        return
    }
    try {
        await ArticleModel.findByIdAndUpdate(info,{show:getParams.show}).exec()
            .then((data) => {
                ctx.status =200
                if(data){
                    ctx.body = resObj(1,'修改成功',data)
                } else {
                    ctx.body = resObj(2,'不存在项')
                }
            })
            .catch((e) => {
                ctx.status =200
                ctx.body = resObj(0,'修改出错',e.toString())
            })
    } catch(e){
        ctx.status =200
        ctx.body = resObj(-1,'数据库错误',e.toString())
    }
}
// index_page
exports.INDEX_PAGE_INFO_API = async(ctx,next)=>{
    let getParams = ctx.request.query
    try {
        let data = await searchArticleForUser(getParams)
        let resData = getReturnData(data)
        let tagList =await getAllTags()
        resData.tagList =tagList
        ctx.body = resObj(1,'查询成功',resData)
        setTopSiteRead()
    } catch (e){
        ctx.body = resObj(0,'查询出错',e.toString())
    }
}
// search_class
exports.SEARCH_CLASS_INFO_API = async(ctx,next)=>{
    let getParams = ctx.request.query
    let info = {classic:getParams.classic}
    let count = parseInt(getParams.count?getParams.count:0)
    let sortWay =  {time:getParams.time?getParams.time:1}
    try {
        await ArticleModel.find(info).limit(count).sort(sortWay).exec()
        .then((data) => {
            let resData = getReturnData(data)
            ctx.body = resObj(1,'查询成功',resData)
        })
        .catch((e) => {
            ctx.status =200
            ctx.body = resObj(0,'查询出错',e.toString())
        })
    } catch(e){
        ctx.status =200
        ctx.body = resObj(-1,'数据库错误',e.toString())
    }
}
// search_tag 
exports.SEARCH_TAG_INFO_API = async(ctx,next)=>{
    let getParams = ctx.request.query
    let info = {'tag.tagId':{$in:getParams.tag}}
    let count = parseInt(getParams.count?getParams.count:0)
    let sortWay =  {time:getParams.time?getParams.time:1}
    try {
        await ArticleModel.find(info).limit(count).sort(sortWay).exec()
        .then((data) => {
            let resData = getReturnData(data)
            ctx.status =200
            ctx.body = resObj(1,'查询成功',resData)
        })
        .catch((e) => {
            ctx.status =200
            ctx.body = resObj(0,'查询出错',e.toString())
        })
    } catch(e){
        ctx.status =200
        ctx.body = resObj(-1,'数据库错误',e.toString())
    }
}
// search_one
exports.SEARCH_ONE_ARTICLE_INFO_API = async(ctx,next)=>{
    let info = ctx.request.query.id
    let isAdmin = ctx.request.query.auth
    try {
        await ArticleModel.findById(info).exec()
            .then((data) => {
                if (data) {
                    if(isAdmin) {
                        let pv = data.pv
                        ArticleModel.findByIdAndUpdate(info,{pv:pv+1}).exec()
                    } 
                    let resData = getReturnArticle(data)
                    ctx.status = 200
                    ctx.body = resObj(1,'查询成功',resData)
                } else {
                    ctx.status = 200
                    ctx.body = resObj(-1,'不存在该项')
                }
            })
            .catch((e) => {
                ctx.status =200
                ctx.body = resObj(0,'发生错误',e.toString())
            })
    } catch(e){
        ctx.status =200
        ctx.body = resObj(-1,'数据库错误',e.toString())
    }
}
// serach_all_tags
exports.SEARCH_ALLTAGS_API = async(ctx,next)=>{
    let getParams = ctx.request.query
    try {
        let tagList =await getAllTags()
        ctx.body = resObj(1,'查询成功',tagList)
    } catch (e){
        ctx.body = resObj(0,'查询出错',e.toString())
    }
}

// upload images
exports.UPLOAD_IMAGE_API = async(ctx,next)=>{
    try {
        let fileName = ctx.req.file.filename
        let resData = {}
        resData.fileName = fileName
        resData.filePath = 'uploads/' + fileName
        ctx.body = resObj(1,'上传成功',resData)
    } catch (e){
        ctx.body = resObj(0,'上传出错',e.toString())
    }
}
// top 10 marknum
exports.GET_TOP_MARKS_INFO = async(ctx,next)=>{
    let sortWay = {'markNum': -1}
    try {
        let resData = await ArticleModel.find().limit(10).sort(sortWay).exec()
        ctx.body = resObj(1,'查询成功',resData)
    } catch (e){
        ctx.body = resObj(0,'查询出错',e.toString())
    }
}
const getTopMarksInfo = async(ctx,next)=>{
    let sortWay = {'markNum': -1}
    try {
        let resData = await ArticleModel.find().limit(10).sort(sortWay).exec()
        return resData
    } catch (e){
        return false
    }
}
// top 10 READING_ARTICLE
exports.GET_TOP_READ_INFO = async(ctx,next)=>{
    let sortWay = {'pv': -1}
    try {
        let resData = await ArticleModel.find().limit(10).sort(sortWay).exec()
        ctx.body = resObj(1,'查询成功',resData)
    } catch (e){
        ctx.body = resObj(0,'查询出错',e.toString())
    }
}
const getTopReadInfo = async(ctx,next)=>{
    let sortWay = {'pv': -1}
    try {
        let resData = await ArticleModel.find().limit(10).sort(sortWay).exec()
        return resData
    } catch (e){
        return false
    }
}
// top 10 READING_SITE
const setTopSiteRead = async()=>{
    try {
        let data = await siteReadingModel.find().exec()
        if (data.length != 0) {
            let info = data[0]._id
            let total = data[0].totalViews
            await siteReadingModel.findByIdAndUpdate(info,{totalViews:total+1}).exec()
        } else {
            // 第一次
            let obj = new siteReadingModel({totalViews: 1})
            await obj.save()
        }
    } catch (e){
        throw(e)
    }
}

const getTopReadSiteInfo = async(ctx,next)=>{
    try {
        let data = await siteReadingModel.find().exec()
        if (data.length != 0) {
            let resData = data[0].dayViewsList.slice(-10)
            let result = []
            resData.forEach((item,i) => {
                let obj = {}
                obj.id = item._id
                obj.time = FormatDate(item.time)
                obj.dayViews = item.dayViews
                result.push(obj)
            })
            return result
        } else {
            // 第一次
            let obj = new siteReadingModel()
            await obj.save()
            return '暂无数据'
        }
    } catch (e){
        return fasle
    }
}
// top 10 READING_SITE
exports.GET_TOP_READSITE_INFO = async(ctx,next)=>{
    try {
        let data = await siteReadingModel.find().exec()
        if (data.length != 0) {
            let resData = data[0].dayViewsList.slice(-10)
            ctx.body = resObj(1,'查询成功',resData)
        } else {
            // 第一次
            let obj = new siteReadingModel()
            await obj.save()
            ctx.body = resObj(2,'暂无数据')
        }
    } catch (e){
        ctx.body = resObj(0,'查询失败',e.toString())
    }
}

// data_analysis
exports.GET_CHART_DATA_INFO = async(ctx,next)=>{
    let resData = {}
    try {
        resData.TopMarksInfo =await getTopMarksInfo()
        resData.TopReadInfo  =await getTopReadInfo()
        resData.TopReadSiteInfo =await getTopReadSiteInfo()
        ctx.body = resObj(1,'查询成功',resData)
    } catch (e) {
        ctx.body = resObj(0,'查询失败',e.toString())
    }
}

// search_article_list_info
const searchArticle = async (info) => {
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
    } else if(info.pv) {
        sortWay =  {pv:info.pv}
    } else if(info.markNum) {
        sortWay =  {markNum:info.markNum}
    } else{
        sortWay = {time:-1} 
    }
    let searchInfo = {}
    if (info.tag) {
        searchInfo['tag.tagName'] = {$in:info.tag}
    }
    if (info.author) {
        searchInfo.author = info.author
    }
    if (info.title) {
        searchInfo.title = info.title
    }
    if (info.classic) {
        searchInfo.classic = info.classic
    }
    if (info.show) {
        if(info.show =='已发表'){
            searchInfo.show = 1
        }
        if(info.show =='撰写中'){
            searchInfo.show = 0
        }
    }
    let length = await ArticleModel.find(searchInfo).count()
    let data = await ArticleModel.find(searchInfo).limit(count).skip(skipNum).sort(sortWay).exec()
    return {
        length: length,
        data: data
    }
}
const searchMarks = async (info) => {
    // 排序
    let sortWay
    if (info.time) {
        sortWay =  {time:info.time} 
    } else{
        sortWay = {time:-1} 
    }
    console.log(info)
    let searchInfo = {}
    if (info.markUser) {
        searchInfo['markList.userName'] = {$in:info.markUser}
    }
    if (info.replyUser) {
        searchInfo['markList.replyList.replyName'] = {$in:info.replyUser}
    }
    if (info.replyShow) {
        if(info.replyShow == 2) info.replyShow = [0,1]
        searchInfo['markList.replyList.replyShow'] = {$in:info.replyShow}
    }
    if (info.markShow) {
        if(info.markShow == 2) info.markShow = [0,1]
        searchInfo['markList.markShow'] = {$in:info.markShow}
    }
    if (info.author) {
        searchInfo.author = info.author
    }
    if (info.title) {
        searchInfo.title = info.title
    }
    if (info.classic) {
        searchInfo.classic = info.classic
    }
    if (info.show) {
        if(info.show =='已发表'){
            searchInfo.show = 1
        }
        if(info.show =='撰写中'){
            searchInfo.show = 0
        }
    }
    console.log(searchInfo)
    let allData = await ArticleModel.find(searchInfo).sort(sortWay).exec()
    console.log(allData)
    return allData
}

//search_show_article_list_info
const searchArticleForUser = async (info) => {
    let count = parseInt(info.count?info.count:0)
    let sortWay =  {time:info.time?info.time:-1} 
    return await ArticleModel.find({show:1}).limit(count).sort(sortWay).exec()
}
// get_all_tags_info
const getAllTags = async () => {
    let data = await ArticleModel.find().exec()
    let tags = []
    let tagId = []
    /**
     *  先取到所有tagID,去重
     *  然后反查出所有标签
     */
    data.forEach((item, i) => {
        item.tag.forEach((tag,j) => {
            if(tagId.indexOf(tag.tagId) == -1){
                tagId.push(tag.tagId)
            }
        })
    })
    // console.log(tagId)
    let flag
    tagId.forEach((tagid, i) => {
        flag = true
        data.forEach((item,j) => {
            item.tag.forEach((tag,j) => {
                if(flag && tagid == tag.tagId){
                    tags.push(tag)
                    flag = false
                }
            })
        })
    })
    return tags
}
// 组合返回值
const getReturnData = (data) => {
    let allArticleList=[]
    let articleList =[]
    data.forEach((item,i) => {
        if (i < 10) {
            let obj = {}
            obj.id = item._id
            obj.markNum = item.markNum
            obj.imgSrc = item.imgUrl
            obj.time = FormatDate(item.time)
            obj.title = item.title
            obj.intr = item.abstract
            articleList.push(obj)
        }
        let obj2 = {}
        obj2.id = item._id
        obj2.markNum = item.markNum
        obj2.time = FormatDate(item.time)
        obj2.title = item.title
        allArticleList.push(obj2)
    })
    return {
        articleList: articleList,
        allArticleList: allArticleList
    }
}
// 组合返回值文章页
const getReturnArticle = (data) => {
    let obj = {}
    for(let key in data) {
        obj.id =  data._id
        obj.markNum = data.markNum
        obj.time = FormatDate(data.time)
        obj.title = data.title
        obj.tag = data.tag
        obj.pv = data.pv
        obj.markdown = data.markdown
        obj.show = data.show
        obj.classic = data.classic
        obj.content = data.content
        obj.author = data.author
    }
    obj.markList = []
    data.markList.forEach((item,i)=>{
        let mark = {}
        mark.markId = item._id
        mark.userName = item.userName
        mark.userEmail = item.userEmail
        mark.markContent = item.markContent
        mark.markShow = item.markShow
        mark.likeNum = item.likeNum
        mark.markTime = FormatDate(item.markTime,1)
        mark.replyList = []
        item.replyList.forEach((replyItem,j)=>{
            let reply = {}
            reply.replyId = replyItem._id
            reply.replyName = replyItem.replyName
            reply.replyShow = replyItem.replyShow
            reply.replyedUser =  replyItem.replyedUser
            reply.replyEmail = replyItem.replyEmail
            reply.replyTime = FormatDate(replyItem.replyTime,1)
            reply.replyContent = replyItem.replyContent
            mark.replyList.push(reply)
        })
        obj.markList.push(mark)
    })
    return obj
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
/*
定时存储浏览量(1d)
*/
setInterval(async()=>{
    try {
        let data = await siteReadingModel.find().exec()
        if (data.length != 0) {
            let info = data[0]._id
            let total = data[0].totalViews
            let preViews = data[0].preViews
            let dayViewsList = data[0].dayViewsList
            let dayViews = total - preViews
            let obj = {
                dayViews: dayViews
            }
            dayViewsList.push(obj)
            await siteReadingModel.findByIdAndUpdate(info,{preViews:total,dayViewsList:dayViewsList}).exec()
        } else {
            // 第一次
            let obj = new siteReadingModel()
            await obj.save()
        }
    } catch (e) {
        console.log(e)
    }
},1000*60*60*24);