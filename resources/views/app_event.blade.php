<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>{{$title}}</title>
    <meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no">
    <style>
        body {
            padding: 0;
            margin: 0;
            touch-action: manipulation;
            -webkit-tap-highlight-color: transparent;
            -webkit-user-select: none;
            font-size: 0;
        }

        img {
            width: 100%;
            display: inherit;
        }
    </style>
    <script type="text/javascript">
        window.user = false;
        apiready = function () {
            api.getPrefs({
                key: 'user'
            }, function (ret) {
                if (ret.value) {
                    user = JSON.parse(ret.value);
                } else {
                    user = false;
                }
            });
        };
        window.onLogin = function (ret, params) {
            if (ret) {
                api.openWin(params);
            }
        };
        window.openWin = function (params, login) {
            if (login && !user) {
                var execScript = {
                    name: api.winName,
                    frameName: api.frameName,
                    script: 'window.onLogin(result,' + JSON.stringify(params).replace(/'/g, "\\'") + ')'
                };
                api.openWin({
                    name: 'login_win',
                    url: 'widget://html/new_win.html',
                    bounces: false,
                    bgColor: "#fff",
                    delay: 500,
                    pageParam: {
                        script: "./lib/user/personal/login/index.js",
                        openIndex: params.openIndex || false,
                        onLogin: JSON.stringify(execScript)
                    }
                });
            } else {
                api.openWin(params);
            }
        }
    </script>
    <script src="{!!url('/public_js')!!}"></script>
</head>
<body>
{!!$content!!}
</body>
</html>

