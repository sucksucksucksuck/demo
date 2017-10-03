<!DOCTYPE html>
<html lang="ch">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="renderer" content="webkit">
    <link rel="icon" href="{!! url("favicon.ico") !!}" type="image/x-icon">
    <link rel="shortcut icon" href="{!! url("favicon.ico") !!}" type="image/x-icon">
    <title>{{$title}}</title>
    <script type="text/javascript" src="https://lib.fuqian.la/h5jssdk.4.0.js"></script>
    <script type="text/javascript">
        function callback(data) {
            console.log(data);
        }
        window.addEventListener('load', function () {
            FUQIANLA.init({!!$params!!});
        }, false);
    </script>
</head>
</html>
