let perpage = 2,
    page = 1,
    pages = 0,
    comments = []
//每次页面重载时就重新获取一下改文章的所有评论
$.ajax({
    url:'/api/comment',
    data:{
        contentid:$('#contentId').val()
    },
    success:function(responseData) {
        comments = responseData.data.reverse()
        renderComment()
    }
})
//提交评论
$('#messageBtn').on('click',()=>{
    $.ajax({
        type:'POST',
        url:'/api/comment/post',
        data:{
            //借用隐藏域获取contentid
            contentid:$('#contentId').val(),
            content:$('#messageContent').val()
        },
        success:function(responseData) {
            //评论提交后，内容清空
            $('#messageContent').val('')
            //最新评论在前
            comments = responseData.data.comments.reverse()
            renderComment()
        }
    })
})

$('.pager').delegate('a','click',function() {
    if($(this).parent().hasClass('previous')){
        page--
    }else {
        page++
    }
    renderComment()
})

function renderComment() {
    let html = '',
        start = Math.max(0,(page-1)*perpage),
        end = Math.min(start+perpage,comments.length),
        $lis = $('.pager li')
    pages = Math.max(Math.ceil(comments.length/perpage),1)
    $lis.eq(1).html(page+'/'+pages)

    if(page<=1) {
        page = 1
        $lis.eq(0).html('<span>没有上一页了</span>')
    }else{
        $lis.eq(0).html('<a href="javascript:;">上一页</a>')
    }
    if(page>=pages){
        page = pages
        $lis.eq(2).html('<span>没有下一页了</span>')
    }else{
        $lis.eq(2).html('<a href="javascript:;">下一页</a>')
    }

    if(comments.length==0) {
        $('.messageList').html('<div class="messageBox"><p>还没有评论</p></div>')
    }else{
        for(let i=start;i<end;i++) {
            html += `<div class="messageBox">
                    <p class="name clear">
                        <span class="fl">${comments[i].username}</span>
                        <span class="fr">${formatDate(comments[i].postTime)}</span>
                    </p>
                    <p>${comments[i].content}</p>
                   </div>`
        }
        $('.messageList').html(html)
    }
    $('#messageCount').html(comments.length)
}

//时间格式化
function formatDate(d) {
    let date = new Date(d)
    return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
}