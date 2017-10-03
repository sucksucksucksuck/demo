<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>个人中心</title>
    <link rel="stylesheet" href="{{url('/event/weixin/user.css')}}">
    <script src="{{url('/event/js/jquery.min.js')}}"></script>
    <meta name="viewport" content="maximum-scale=1.0,minimum-scale=1.0,user-scalable=0,width=device-width,initial-scale=1.0"/>
</head>
<body>
    <div class="user-main">
        <div>
            <div class="icon-main">
                <div>
                    <div class="icon">
                        <img id="icon" src="{{url('/event/weixin/images/default_icon.png')}}" alt="">
                    </div>
                    <div class="user-name">{{$nickname}}</div>
                </div>
            </div>
            <div class="user-info">
                <div class="item">
                    <div>盘古账号</div>
                    <div class="user-id">{{$id}}</div>
                </div>
                <div class="item">
                    <div>手机号</div>
                    <div class="user-phone">{{$phone}}</div>
                </div>
                <div class="item">
                    <div>联系客服</div>
                    <div class="service-phone"><a href="tel:4000767871">4000767871</a></div>
                </div>
            </div>
            <div class="user-bind">
                <div>您还没绑定盘古云购账号</div>
                <div class="go-bind">立即绑定</div>
            </div>
        </div>
        <div class="surprised"></div>
    </div>
    <script src="http://res.wx.qq.com/open/js/jweixin-1.2.0.js"></script>
    <script>
        $(function () {
            window.config = {root:'{{url('')}}'}; //"http://back.pgyg.com/fetch?url=" . urlencode(url(""))
            share();
            function share() {
                $.ajax({
                    type:"POST",
                    async:false,
                    url:window.config.root+"/wx/pgash/page/share",
                    data:{url:location.href.split('#')[0]},
                    dataType:"json",
                    success:function (res) {
                        wx.config({
                            debug: false,
                            appId: res.data.appId,
                            timestamp: res.data.timestamp,
                            nonceStr: res.data.nonceStr,
                            signature: res.data.signature,
                            jsApiList: ['hideMenuItems']
                        });
                        wx.ready(function(){
                            wx.hideMenuItems({
                                menuList: [
                                    "menuItem:share:appMessage",
                                    "menuItem:share:timeline",
                                    'menuItem:share:qq',
                                    'menuItem:share:weiboApp',
                                    'menuItem:share:QZone'
                                ]
                            });
                        });
                    },
                    error:function (error) {
                        alert(error)
                    }
                })
            }
            if('{{$id}}'){
                $('.user-info').css({'display':'block'});
                $('#icon').attr('src','{{$icon}}')
            }else{
                $('.user-bind').css({'display':'block'});
                $('.go-bind').on('click',function () {
                    window.location.href = '{{url("/wx/view/pgash/$open_id")}}';
                    {{--window.location.href = '{{"http://back.pgyg.com/fetch?url=" . urlencode(url("/wx/view/pgash/$open_id"))}}';--}}
                })
            }
        })
    </script>
</body>
</html>