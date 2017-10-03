/**
 * Created by lrx on 2017/7/11.
 */
const initialState = {
    payArray:[],
    input:{},
    serverArray:[],
    writes:{},
    /*mp3*/
    filename: "未上传文件",
    tag:[],
    label:{},
    /*推荐码*/
    ss: false,
    /*中奖*/
    tt: false,
    uu: false,
    remove_show: false,
    font_show: true,
    font: "手机；iPhone；美图手机",
    store:false
};
const defaultState = cloneObject(initialState);
export default function (state = defaultState, action) {
    switch (action.type) {
        case 'APP_INIT':
            state.payArray=action.payload.pay;
            state.payArray.map(function(item,index){
                item.ios_show = true;
                item.android_show = true;
                state.input[`id_${item.id}`] = item.ios_version;
                state.input[`index_${index}`] = item.android_version;
            });
            state.tag = action.payload.tag;
            state.tag.map(function(item,index){
                if(item.extend.tag_img){
                    state.label[`id_${item.id}`] = item.extend.tag_img.substr((item.extend.tag_img.lastIndexOf("/")) + 1);
                }else{
                    state.label[`id_${item.id}`]="未上传图片"
                }
            });
            return {
                ...state,
            };
        case 'SERVICE_INIT':
            state.serverArray = action.payload;
            state.serverArray.map(function (item,index) {
               item.show = true;
                state.writes[`id_${item.id}`] = item.content;
            });
            return{
                ...state
            };
        default:
            return state;
    }
}