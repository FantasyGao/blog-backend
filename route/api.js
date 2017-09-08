const Router = require('koa-router');
const multer = require('koa-multer'); //上传文件


const router = new Router({
	prefix:'/api'
});

const checkToken = require('./auth.js');

const articleAPI = require('../api/articleAPI.js')
const userAPI = require('../api/userAPI.js')
const logAPI = require('../api/logAPI.js')


//上传配置  
const storage = multer.diskStorage({  
	//文件保存路径  
	destination: function (req, file, cb) {  
		cb(null, 'public/uploads/')  
	},  
	//修改文件名称  
	filename: function (req, file, cb) {
		var fileFormat = (file.originalname).split(".");  
		cb(null,Date.now() + "." + fileFormat[fileFormat.length - 1]);  
	}  
})
const limits = {
	fieldSize: '2MB',
	files: 5
}
//加载配置  
const upload = multer({ storage: storage, limits: limits});  

// admin
const add         = articleAPI.ADD_ARTICLE_INFO_API
const searchAll   = articleAPI.SEARCH_ARTICLE_INFO_API
const editArticle = articleAPI.EDIT_ARTICLE_INFO_API
// upload
const uploadImage = articleAPI.UPLOAD_IMAGE_API

const deleteReply   = articleAPI.DETELE_REPLY_INFO_API
const deleteArticle = articleAPI.DELETE_ARTICLE_INFO_API
const deleteMark    = articleAPI.DETELE_MARK_INFO_API
const editShow      = articleAPI.EDIT_SHOW_INFO_API

const searchMarks      = articleAPI.SEARCH_MARKS_INFO_API
const editMarkShow     = articleAPI.EDIT_MARKS_SHOW_API
const searchReplys     = articleAPI.SEARCH_REPLYS_INFO_API
const editReplyShow    = articleAPI.EDIT_REPLYS_SHOW_API
const searchAllMarkers = articleAPI.SEARCH_MARKERS_INFO_API
const searchReplyers   = articleAPI.SEARCH_REPLYERS_INFO_API

// 关注用户
const addAttentionUser    = articleAPI.ADD_ATTIENTION_INFO_API
const printConcernedUser  = userAPI.PRINT_CONCERNEDUSER_API
const deleteConcernedUser = userAPI.DELETE_CONCERNEDUSER_API

// 分析模块
const getTopMarks    = articleAPI.GET_TOP_MARKS_INFO
const getTopRead     = articleAPI.GET_TOP_READ_INFO
const getTopSiteRead = articleAPI.GET_TOP_READSITE_INFO
const chartData = articleAPI.GET_CHART_DATA_INFO

// 用户模块
const addUser        = userAPI.USER_REGISTER_API
const login          = userAPI.USER_LOGIN_API
const updatePassword = userAPI.USER_UPDATA_PASSWORD_API
const printUser      = userAPI.USER_PRINT_API
const deleteUser     = userAPI.USER_DETELE_API
const editRemark     = userAPI.EDIT_REMARK_API

// 用户日志
const userLog   = logAPI.LOGS_USER_API
const deleteLog = logAPI.DELETE_LOGS_USER_API

// public
const searchOne     = articleAPI.SEARCH_ONE_ARTICLE_INFO_API
const searchClassic = articleAPI.SEARCH_CLASS_INFO_API
const searchTag     = articleAPI.SEARCH_TAG_INFO_API
const searchShowArt = articleAPI.SEARCH_SHOW_ARTICLE_INFO_API
const searchAllTags = articleAPI.SEARCH_ALLTAGS_API

const addMark    = articleAPI.ADD_MARK_INFO_API 
const addReply   = articleAPI.ADD_REPLY_INFO_API
const addLike    = articleAPI.ADD_LIKE_INFO_API
const indexPage  = articleAPI.INDEX_PAGE_INFO_API

/**
 *  admin
 */
router.post('/addArticle',checkToken,add)
router.post('/editArticle',checkToken,editArticle)
router.get('/searchAll',checkToken,searchAll)
router.get('/searchShowArt',checkToken,searchShowArt)
router.get('/deleteReply',checkToken,deleteReply)
router.get('/deleteArticle',checkToken,deleteArticle)
router.get('/deleteMark',checkToken,deleteMark)
router.get('/editShow',checkToken,editShow)
router.get('/updatePassword',checkToken,updatePassword)
router.get('/printUser',checkToken,printUser)
router.get('/deleteUser',checkToken,deleteUser)
router.get('/editRemark',checkToken,editRemark)
router.get('/searchMarks',checkToken,searchMarks)
router.get('/editMarkShow',checkToken,editMarkShow)
router.get('/searchReplys',checkToken,searchReplys)
router.get('/editReplyShow',checkToken,editReplyShow)
router.get('/searchAllMarkers',checkToken,searchAllMarkers)
router.post('/addAttentionUser',checkToken,addAttentionUser)
router.get('/searchReplyers',checkToken,searchReplyers)

router.post('/upload',upload.single('articleImage'),uploadImage)

router.get('/getTopMarks',getTopMarks)
router.get('/getTopRead',getTopRead)
router.get('/getTopSiteRead',getTopSiteRead)
router.get('/chartData',checkToken,chartData)

router.get('/printConcernedUser',checkToken,printConcernedUser)
router.get('/deleteConcernedUser',checkToken,deleteConcernedUser)
/**
 *  LOGS
 */
router.get('/userLog',checkToken,userLog)
router.get('/deleteLog',checkToken,deleteLog)

/**
 *  USER 
 */
router.get('/register',addUser)
router.get('/login',login)
router.get('/indexPage',indexPage)
router.get('/searchOne',searchOne)
router.get('/searchAllTags',searchAllTags)
router.get('/searchClassic',searchClassic)
router.get('/searchTag',searchTag)
router.post('/addMark',addMark)
router.post('/addReply',addReply)
router.get('/addLike',addLike)

module.exports = router