<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>活动预览</title>
    <meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no">
    <style>
        html, body {
            width: 100%;
            padding: 0;
            margin: 0;
            touch-action: manipulation;
            -webkit-tap-highlight-color: transparent;
            -webkit-user-select: none;
            height: 100%;
            overflow: hidden;
        }

        div {
            width: 800px;
            margin: 0 auto;
            height: 100%;
        }

        iframe {
            width: 100%;
            border: 0;
            padding: 0;
            margin: 0;
            height: 100%;
        }
    </style>
</head>
<body>
<div>
    <iframe src="{{$src}}" frameborder="0">

    </iframe>
</div>
</body>
</html>
