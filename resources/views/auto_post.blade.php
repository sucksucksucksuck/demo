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
</head>
<body onLoad="document.auto_form.submit();">
<form name="auto_form" method="post" action="{{$action}}">
    @foreach ($params as $name=>$value)
        <input type="hidden" name="{{$name}}" value="{{$value}}"/>
    @endforeach
</form>
</body>
</html>
