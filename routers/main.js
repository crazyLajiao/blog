let express = require('express'),
    router = express.Router(),
    Category = require('../models/Category'),
    Content = require('../models/Content'),
    data

//处理通用数据
router.use((req,res,next)=>{
    data = {
        userInfo:req.userInfo,
        categories:[],
    }
    Category.find().then((categories)=>{
        data.categories = categories
        next()
    })
})

router.get('/',(req,res,next)=> {
    data.category = req.query.category || ''
    data.count = 0
    data.page = Number(req.query.page || 1)
    data.limit = 3
    data.pages = 0

    let where = {}
    if(data.category) {
        where.category = data.category
    }
    //读取所有分类信息
    Content.where(where).count().then((count)=>{
        data.count = count
        //数据的页数
        data.pages = Math.ceil(data.count / data.limit)
        //page范围
        data.page = Math.min(data.page,data.pages)
        data.page = Math.max(data.page,1)
        let skip = (data.page-1)*data.limit
        //导航条中点击时，where作为分类选择的条件
        return Content.where(where).find().limit(data.limit).skip(skip).populate(['category','user']).sort({addTime:-1})

    }).then((contents)=>{
        data.contents = contents
        res.render('main/index',data)
    })

})
//阅读全文
router.get('/view',(req,res)=>{
    let contentId = req.query.contentid || ''
    Content.findOne({_id:contentId}).then((content)=>{
        data.content = content

        content.views++
        content.save()
        res.render('main/view',data)
    })
})
module.exports = router