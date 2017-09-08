const Router = require('koa-router');

const router = new Router({
	prefix:'/other'
});

router.get('/',async(ctx,next)=>{
	ctx.body= { foo: 'bar' };
});

module.exports = router;
