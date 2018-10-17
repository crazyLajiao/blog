$(function() {
    var $loginBox = $('#loginBox')
    var $registerBox = $('#registerBox')
    var $userInfo = $('#userInfo')
    var $logout = $('#logout')

    //切换到注册面板
    $loginBox.find('a').on('click',function() {
        $registerBox.show()
        $loginBox.hide()
        console.log('注册')
    })
    //切换到登录面板
    $registerBox.find('a').on('click',function() {
        $loginBox.show()
        $registerBox.hide()
        console.log('登录')
    })

    //注册
    $registerBox.find('button').on('click',function() {
        //提交ajax请求
        $.ajax({
            type:'post',
            url:'/api/user/register',
            data:{
                username:$registerBox.find('[name="username"]').val(),
                password:$registerBox.find('[name="password"]').val(),
                repassword:$registerBox.find('[name="repassword"]').val()
            },
            dataType:'json',
            success:function(result) {
                $registerBox.find('.colWarning').html(result.message)
                //code为0时成功
                if(!result.code){
                    setTimeout(function() {
                        $loginBox.show()
                        $registerBox.hide()
                    },1000)
                }
            }
        })
    })
    //登录
    $loginBox.find('button').on('click',function() {
        $.ajax({
            type:'post',
            url:'/api/user/login',
            data:{
                username:$loginBox.find('[name="username"]').val(),
                password:$loginBox.find('[name="password"]').val()
            },
            dataType: 'json',
            success:function(result) {
                $loginBox.find('.colWarning').html(result.message)
                //登录成功
                if(!result.code){
                    window.location.reload()
                    // setTimeout(function() {
                    //     $loginBox.hide()
                    //     $userInfo.show()
                    //     $userInfo.find('.username').html(result.userInfo.username)
                    //     $userInfo.find('.info').html('Helllo，welcome to my blog!')
                    // },1000)
                }
            }
        })
    })

    //退出
    $logout.on('click',function() {
        $.ajax({
            url:'/api/user/logout',
            success:function(result) {
                if(!result.code) {
                    //
                    window.location.reload()
                }
            }
        })
    })
})