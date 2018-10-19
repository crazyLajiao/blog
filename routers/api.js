let express = require('express'),
    router = express.Router(),
    User = require('../models/User'),  //返回是构造函数
    Content = require('../models/Content'),
    crypto = require('crypto'),
    md5 = require('../models/md5')


//统一返回格式
router.use((req,res,next)=>{
    responseData = {
        code:0,
        message: ''
    }
    next()
})

//用户注册
router.post('/user/register',(req,res,next)=>{
    // console.log(req.body)
    var username = req.body.username
    var password = md5(md5(req.body.password))
    var repassword = md5(md5(req.body.repassword))

    if(username==''){
        responseData.code = 1
        responseData.message = '用户名不能为空'
        res.json(responseData)
        return
    }
    if(password==''){
        responseData.code = 2
        responseData.message = '密码不能为空'
        res.json(responseData)
        return
    }
    if(password!=repassword) {
        responseData.code = 3
        responseData.message = '两次输入的密码不一致'
        res.json(responseData)
        return
    }
    //通过数据库验证是否用户名已注册
    User.findOne({
        username,
    }).then(function(userInfo) {
        // console.log(userInfo)
        //数据库中存在，则已存在
        if(userInfo) {
            responseData.code = 4
            responseData.message = '该用户名已注册'
            res.json(responseData)
            return
        }
    //    保存到数据库中
        var user = new User({username,password})
        return user.save()
    }).then(function(newUserInfo){
        //返回新纪录
        // console.log(newUserInfo)
        responseData.message = '注册成功！'
        res.json(responseData)
        return
    })

})

//用户登录
router.post('/user/login',(req,res)=>{
    var username = req.body.username
    var password = md5(md5(req.body.password))
    if(username==''||password==''){
        responseData.code = 1
        responseData.message = '用户名或密码不能为空'
        res.json(responseData)
        return
    }
    User.findOne({
        username,password
    }).then(function(userInfo) {
        // console.log(userInfo)
        if(!userInfo) {
            responseData.code = 2
            responseData.message = '用户名或密码错误'
            res.json(responseData)
            return
        }
        responseData.message = '登陆成功!'
        responseData.userInfo = {
            _id:userInfo._id,
            username:userInfo.username
        }
        req.cookies.set('userInfo',JSON.stringify({
            _id:userInfo._id,
            username:userInfo.username
        }))
        res.json(responseData)
        return
    })
})

//退出
router.get('/user/logout',(req,res)=>{
    //清除cookie
    req.cookies.set('userInfo',null)
    res.json(responseData)
    return
})

//获取指定文章的所有评论
router.get('/comment',(req,res)=>{
    //get方式获取的
    let contentId = req.query.contentid || ''
    Content.findOne({_id:contentId}).then((content)=>{
        responseData.data = content.comments
        res.json(responseData)
    })
})
//提交评论
router.post('/comment/post',(req,res)=>{
    let contentId = req.body.contentid || '',
        postData = {
            username: req.userInfo.username,
            postTime: new Date(),
            content: req.body.content
        }
    //  查询当前内容的信息
    Content.findOne({_id:contentId}).then((content)=>{
        content.comments.push(postData)
        return content.save()
    }).then((newContent)=>{
        responseData.message =  '评论成功'
        responseData.data = newContent
        res.json(responseData)
        return
    })

})
module.exports = router