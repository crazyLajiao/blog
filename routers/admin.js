let express = require('express'),
    router = express.Router(),
    User = require('../models/User'),
    Category = require('../models/Category'),
    Content = require('../models/Content')

router.use((req,res,next)=>{
    if(!req.userInfo.isAdmin){
        res.send('对不起，只有管理员可以进入后台管理界面')
        return
    }
    next()
})
router.get('/',(req,res,next)=>{
    res.render('admin/index',{
        userInfo:req.userInfo
    })
})
//用户管理
router.get('/user',(req,res)=>{
    //从数据库中读取所有用户数据,并分页显示
    let page = Number(req.query.page || 1),
        limit = 2,
        skip = 0,
        pages = 0
    User.count().then((count)=>{
        //数据的页数
        pages = Math.ceil(count / limit)
        //page范围
        page = Math.min(page,pages)
        page = Math.max(page,1)
        skip = (page-1)*limit
        User.find().limit(limit).skip(skip).then((users)=>{
            res.render('admin/user_index',{
                userInfo:req.userInfo,
                users,
                count,
                pages,
                limit,
                page
            })
        })
    })

})

//分类首页
router.get('/category',(req,res)=>{
    let page = Number(req.query.page || 1),
        limit = 2,
        skip = 0,
        pages = 0
    Category.count().then((count)=>{
        //数据的页数
        pages = Math.ceil(count / limit)
        //page范围
        page = Math.min(page,pages)
        page = Math.max(page,1)
        skip = (page-1)*limit
        Category.find().sort({_id:-1}).limit(limit).skip(skip).then((categories)=>{
            res.render('admin/category_index',{
                userInfo:req.userInfo,
                categories,
                count,
                pages,
                limit,
                page
            })
        })
    })
})
//分类的添加
router.get('/category/add',(req,res)=>{
    res.render('admin/category_add',{
        userInfo:req.userInfo
    })
})
//添加的分类的保存（表单）
router.post('/category/add',(req,res)=>{
    let name = req.body.name || ''
    if(name=='') {
        res.render('admin/error',{
            userInfo:req.userInfo,
            message:'名称不能为空'
        })
        return
    }
    //判断数据库中是否存在同名分类
    Category.findOne({name}).then((rs)=>{
        if(rs) {
            res.render('admin/error',{
                userInfo:req.userInfo,
                message:'分类已经存在'
            })
            return Promise.reject()
        }else {
            //将分类保存到数据库
            return new Category({
                name
            }).save()
        }
    //    保存成功返回新纪录对象
    }).then(function(newCategory) {
        res.render('admin/success',{
            userInfo:req.userInfo,
            message:'分类保存成功',
            url:'/admin/category'
        })
    })
})
//分类修改
router.get('/category/edit',(req,res)=>{
//    以表单形式展示要修改的分类的信息
    let id=req.query.id || ''
    Category.findOne({_id:id}).then((category)=>{
        if(!category) {
            res.render('admin/error',{
                userInfo:req.userInfo,
                message:'分类信息不存在'
            })
            return Promise.reject()
        }else {
            res.render('admin/category_edit',{
                userInfo:req.userInfo,
                category
            })
        }
    })
})
//分类的修改保存
router.post('/category/edit',(req,res)=>{
    let id = req.query.id || '',
        name = req.body.name || ''
    Category.findOne({_id:id}).then((category)=>{
        if(!category){
            res.render('admin/error',{
                userInfo:req.userInfo,
                message:'分类信息不存在'
            })
            return
        }else {
        //    用户没有修改分类的提交
            if(name==category.name) {
                res.render('admin/success',{
                    userInfo:req.userInfo,
                    message:'修改成功',
                    url:'/admin/category'
                })
            }else{
                //    要修改的分类名称是否已经存在:id不等，name相等
                return Category.findOne({_id:{$ne:id},name})
            }
        }
    }).then((sameCategory)=>{
        if(sameCategory) {
            res.render('admin/error',{
                userInfo:req.userInfo,
                message:'数据库中已经存在了'
            })
            return
        }else{
            return Category.update({_id:id},{name})
        }
    }).then(()=>{
        res.render('admin/success',{
            userInfo:req.userInfo,
            message:'修改成功',
            url: '/admin/category'
        })
    })
})
//分类删除
router.get('/category/delete',(req,res)=>{
    let id = req.query.id || ''
    Category.remove({_id:id}).then(()=>{
        res.render('admin/success',{
            userInfo:req.userInfo,
            message:'删除成功',
            url: '/admin/category'
        })
    })
})

//内容首页
router.get('/content',(req,res)=>{
    let page = Number(req.query.page || 1),
        limit = 2,
        skip = 0,
        pages = 0
    Content.count().then((count)=>{
        //数据的页数
        pages = Math.ceil(count / limit)
        //page范围
        page = Math.min(page,pages)
        page = Math.max(page,1)
        skip = (page-1)*limit
        Content.find().limit(limit).skip(skip).populate(['category','user']).sort({addTime:-1}).then((contents)=>{
            res.render('admin/content_index',{
                userInfo:req.userInfo,
                contents,
                count,
                pages,
                limit,
                page
            })
        })
    })
})
//内容的添加
router.get('/content/add',(req,res)=>{
    Category.find().sort({_id:-1}).then((categories)=>{
        res.render('admin/content_add',{
            userInfo:req.userInfo,
            categories
        })
    })
})
//添加的内容的保存
router.post('/content/add',(req,res)=>{
    if(req.body.category=='') {
        res.render('admin/error',{
            userInfo:req.userInfo,
            message:'内容分类不能为空'
        })
        return
    }
    if(req.body.title=='') {
        res.render('admin/error',{
            userInfo:req.userInfo,
            message:'内容标题不能为空'
        })
        return
    }
    //添加到数据库中
    new Content({
        category:req.body.category,
        title:req.body.title,
        user:req.userInfo._id.toString(),
        description:req.body.description,
        content:req.body.content
    }).save().then((rs)=>{
        res.render('admin/success',{
            userInfo:req.userInfo,
            message:'内容保存成功',
            url:'/admin/content'
        })
    })
})
//内容的修改
router.get('/content/edit',(req,res)=>{
    let id=req.query.id || '',
        categories = []
    Category.find().sort({_id:-1}).then((rs)=>{
        categories = rs
        return Content.findOne({_id:id}).populate(['category','user'])
    }).then((content)=>{
        if(!content){
            res.render('admin/error',{
                userInfo:req.userInfo,
                message:'内容信息不存在'
            })
            return Promise.reject()
        }else{
            res.render('admin/content_edit',{
                userInfo:req.userInfo,
                categories,
                content
            })
        }
    })
})
//内容的修改的保存
router.post('/content/edit',(req,res)=>{
    let id = req.query.id || ''
    if(req.body.category=='') {
        res.render('admin/error',{
            userInfo:req.userInfo,
            message:'内容分类不能为空'
        })
        return
    }
    if(req.body.title=='') {
        res.render('admin/error',{
            userInfo:req.userInfo,
            message:'内容标题不能为空'
        })
        return
    }
    Content.update({_id:id},{
        category:req.body.category,
        title:req.body.title,
        description:req.body.description,
        content:req.body.content
    }).then((rs)=>{
        res.render('admin/success',{
            userInfo:req.userInfo,
            message:'内容保存成功',
            url:'/admin/conent/edit?id='+id
        })
    })

})
//内容的删除
router.get('/content/delete',(req,res)=>{
    let id = req.query.id || ''
    Content.remove({_id:id}).then(()=>{
        res.render('admin/success',{
            userInfo:req.userInfo,
            message:'删除成功',
            url: '/admin/content'
        })
    })

})
module.exports = router