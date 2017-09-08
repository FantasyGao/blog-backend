const mongodb = require('./config.js');
const Schema = mongodb.Schema;

// 文章项
let articleItem = {
    time: { type: Date, default: Date.now },
    title:String,
    abstract: String,
    author:String,
    tag:[
        {
            tagId:{ type: Number, default:0 },
            tagName:String
        }
    ],
    content:String,
    markdown:String,
    imgUrl:{ type: String},
    classic:String,
    show:{ type: Number, default:0 },
    pv:{ type: Number, default:0 },
    markNum:{ type: Number, default:0 },
    markList:[
        {
            userName:String,
            userEmail:String,
            markShow: { type: Number, default: 1 },
            markTime: { type: Date, default: Date.now },
            markContent:String,
            likeNum:{ type: Number, default:0 },
            like:[String],
            replyList:[
                {
                    replyName:String,
                    replyEmail:String,
                    replyShow: { type: Number, default: 1 },
                    replyedUser:String,
                    replyTime: { type: Date, default: Date.now },
                    replyContent:String
                }
            ]
        }
    ]
};
// 分析数据
let siteReading = {
    totalViews: {type: Number , default: 0},
    preViews: {type: Number , default: 0},
    dayViewsList: [
        {
            dayViews: {type: Number , default: 0},
            time: { type: Date, default: Date.now }
        }
    ]
};
// 用户项
let adminUser = {
    user:String,
    password:String,
    email:String,
    token:String,
    remark:{ type: String, default: '暂无' },
    joinTime: { type: Date, default: Date.now }
};
// 登录日志
let loginLogs = {
    user:String,
    ip:String,
    massage:String,
    loginTime: { type: Date, default: Date.now }
};

// 关注用户
let concernedUser = {
    user:String,
    email:String,
    title:String,
    ParticipatinComments:String,
    nearTime: String
};

let articleSchema = new Schema(articleItem);
let userSchema = new Schema(adminUser);
let logSchema = new Schema(loginLogs);
let concernedSchema = new Schema(concernedUser);
let siteReadingSchema = new Schema(siteReading);

let articleModel = mongodb.model("articleModel", articleSchema);
let userModel = mongodb.model("userModel", userSchema);
let logModel = mongodb.model("logModel", logSchema);
let concernedModel = mongodb.model("concernedModel", concernedSchema);
let siteReadingModel = mongodb.model("siteReadingModel", siteReadingSchema);

exports.articleAPI = articleModel;
exports.userAPI = userModel;
exports.logAPI = logModel;
exports.concernedAPI = concernedModel;
exports.siteReadingAPI = siteReadingModel;