const jwt = require('jsonwebtoken');
//检查token是否过期
module.exports = async ( ctx, next ) => {
    const token = ctx.get('Authorization');
    if (token === '') {
        ctx.throw(401, "没有token,请登录访问")
    }
    let tokenContent;
    try {
        tokenContent = await jwt.verify(token, 'mynameisFantasyGao');     //如果token过期或验证失败，将抛出错误
    } catch (err) {
        ctx.throw(401, 'token失效');
    }
    await next();
}