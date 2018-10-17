// 入口文件
let express = require('express'),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    Cookies = require('cookies'),
    swig = require('swig'),
    app = express(),
    User = require('./models/User')

//设置静态资源托管
app.use('/public',express.static(__dirname+'/public'))
//设置模板引擎
app.engine('html',swig.renderFile)
app.set('views','./views')
app.set('view engine','html')
swig.setDefaults({cache:false})   //取消模板的默认缓存

app.use(bodyParser.urlencoded({extended:true}))
//设置cookie
app.use(function(req,res,next) {
    req.cookies = new Cookies(req,res)

    //解析登录用户的cookie信息，将登录的用户信息添加为全局变量
    req.userInfo = {}
    if(req.cookies.get('userInfo')) {
        try{
            req.userInfo = JSON.parse(req.cookies.get('userInfo'))
            // 判断当前登录用户是否是管理员
            User.findById(req.userInfo._id).then(function(userInfo) {
                req.userInfo.isAdmin = Boolean(userInfo.isAdmin)
                next()
            })
        }catch(e){
            next()
        }
    }else{
        next()
    }
})

//分模块管理前后端
app.use('/admin',require('./routers/admin'))
app.use('/api',require('./routers/api'))
app.use('/',require('./routers/main'))

mongoose.connect('mongodb://localhost:27017/blog',err=>{
    if(err) {
        console.log('数据库连接失败')
    }else{
        console.log('数据库连接成功')
        app.listen(8081)
    }
})
