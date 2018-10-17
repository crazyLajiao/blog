let mongoose = require('mongoose')
module.exports = new mongoose.Schema({
    //关键字段
    category: {
        //类型
        type: 'ObjectId',
        //引用
        ref: 'Category'
    },
    title:String,
    user:{
        type:'ObjectId',
        ref: 'User'
    },
    //时间
    addTime:{
        type: Date,
        default: new Date()
    },
    //阅读量
    views:{
        type: Number,
        default:0
    },
    description:{
        type:String,
        default:''
    },
    content:{
        type:String,
        default:''
    },
    comments:{
        type:Array,
        default:[]
    }
})