
window.config = {!!$config!!};
@if($is_app)
@else
    $(function () {
        apiready();
    });
    window.api={
        openWin:function(){window.location.href = "http://www.gz.lq.pgyg.com/"},
        getPrefs:function(params){
            if(params.key=='user'){
                return {token:'666666666'}
            }else if(params.key=='token'){
                return '666666666'
            }
        }
    }
@endif