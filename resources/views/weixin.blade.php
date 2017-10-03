<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>账号绑定</title>
    <link rel="stylesheet" href="{{url('/event/weixin/style.css')}}">
    <script src="{{url('/event/js/jquery.min.js')}}"></script>
    <script>window.config = {open_id:'{{$open_id}}',red:'{{$red ?? ''}}',root:'{{url('')}}'}</script>
    {{--<script>window.config = {open_id:'{{$open_id}}',red:'{{$red ?? ''}}',root:'{{"http://back.pgyg.com/fetch?url=" . urlencode(url(""))}}'}</script>--}}
    <meta name="viewport" content="maximum-scale=1.0,minimum-scale=1.0,user-scalable=0,width=device-width,initial-scale=1.0"/>
</head>
<body>
    <div class="account-bind">
        <div class="content">
            <div class="step">
                <div class="step-small">填写手机号码</div>
                <div class="line"></div>
                <div class="step-small">输入验证码</div>
                <div class="line"></div>
                <div class="step-small">完成绑定</div>
            </div>
            <div>
                <div class="item">
                    <input name="phone" class="phone" type="tel" placeholder="请输入手机号码" />
                    <div class="delete delete-phone"></div>
                </div>
                <div class="item">
                    <input name="captcha" class="security" type="tel" placeholder="请输入验证码"/>
                    <div class="delete delete-security"></div>
                    <div class="require">获取验证码</div>
                </div>
                <div class="bind-btn">立即绑定</div>
                <div class="look-question">Q:如何查看会员号(UID)</div>
                <div class="look-answer">A:点击【个人中心】用户名下方即是会员号(UID)</div>
                <div class="look-pic"></div>
            </div>
            <div class="surprised"></div>
            <div class="alert-wrap hide">
                <div class="alert-view">
                    <!--未绑定-->
                    <div class="notice-warn hide">
                        <div class="notice-pic"></div>
                        <div class="title">告知</div>
                        <div class="text-main">
                            <div>亲爱的用户您好:</div>
                            <div>您尚未在盘古云购APP上绑定相应的手机号码,为了保障您的权益,保护个人UID不被恶意绑定,请前往APP上完成手机验证</div>
                            <div class="look-fun">绑定方法&gt;</div>
                        </div>
                        <div class="footer">
                            <div class="cancel">取消</div>
                            <div class="open-app">打开盘古云购</div>
                        </div>
                    </div>
                    <!--绑定确认-->
                    <div class="notice-sure hide">
                        <div class="notice-pic"></div>
                        <div class="text-main">
                            <div class="title">绑定成功</div>
                            <div>恭喜您，成功绑定盘古云购会员号(UID)<span class="uid"></span></div>
                        </div>
                        <div class="footer">
                            <div class="bind-sure">我知道了</div>
                        </div>
                    </div>
                    <!--无效号-->
                    <div class="invalid-phone hide">
                        <div>该手机号已经绑定过微信号了哦</div>
                        <div>请更换手机号码</div>
                        <div class="cancel">我知道了</div>
                    </div>
                </div>
            </div>
        </div>
        <!--绑定方法-->
        <div class="bind-view">
            <div class="main">
                <div>
                    <div>Q:</div>
                    <div>如何在盘古云购APP内绑定手机号?</div>
                </div>
                <div class="answer">
                    <div>A:</div>
                    <div>
                        <div><span>1</span>打开盘古云购APP,登录,找到【个人中心】</div>
                        <div><span>2</span>点击“个人中心”顶部【头像】或【&gt;】图标</div>
                    </div>
                </div>
                <div class="pic">
                    <img src="{{url('/event/weixin/images/old_bind.png')}}" alt="">
                </div>
                <div class="answer">
                    <div></div>
                    <div>
                        <div><span>3</span>点击最后一栏【手机号码】</div>
                        <div><span>4</span>输入手机号，获取验证码，完成整个手机绑定流程</div>
                    </div>
                </div>
                <div class="open-app">打开盘古云购</div>
                <div class="close-bind">返回上一页</div>
            </div>
        </div>
    </div>
    <!--红包页-->
    <div class="red-view">
        <div class="content">
            <div class="red">
                <div class="get-red">获得红包后需要返回盘古云购使用</div>
                <div class="get-red">您已经领取过红包了哦,请到盘古云购进行查看</div>
                <div class="get-red">想知道您获得了多少元红包吗?立即点击领取红包</div>
                <div class="red-amount">恭喜您获得<span class="get-amount"></span>元红包</div>
                <div class="red-amount">点击领取</div>
                <div class="red-big">
                    <div><span>￥</span><span class="big-amount"></span></div>
                    <div>红包有效期为3天</div>
                </div>
                <div class="red-big">
                    <div><span>￥</span><span class="big-amount">???</span></div>
                </div>
            </div>
            <div class="surprised"></div>
        </div>
    </div>
</body>
<script src="http://res.wx.qq.com/open/js/jweixin-1.2.0.js"></script>
<script src="{{url('/event/weixin/index.js')}}" charset="utf-8"></script>
</html>