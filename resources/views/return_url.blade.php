<!DOCTYPE html>
<html lang="ch">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="renderer" content="webkit">
    <style type="text/css">
        html, body {
            width: 100%;
            height: 100%;
            padding: 0;
            margin: 0;
        }

        div {
            font-size: 15px;
            color: #333131;
            text-align: center;
        }

        img {
            width: 140px;
            margin: 88px 0 20px 0;
        }

    </style>
    <script>
        function close() {
            if (api.pageParam.onClose) {
                var script = api.pageParam.onClose.replace('result', "true");
                api.execScript(JSON.parse(script));
            }
            api.closeWin();
        }
        window.apiready = function () {
            close();
            api.addEventListener({
                name: 'viewappear'
            }, function (ret, err) {
                close();
            });
        }
    </script>
</head>
<body>
<div>
    <img src="./image/pay/image_chongzhi.png">
</div>
<div>充值成功</div>
</body>
</html>