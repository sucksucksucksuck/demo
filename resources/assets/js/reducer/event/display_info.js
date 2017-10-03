/**
 * Created by sucksuck on 2017/5/31.
 */
const initialState = {
    info: {
        id: "",
        title: "",//主标题
        describe: "",//副标题
        icon: "",//图片
        begin_at: "",//开始时间
        end_at: "",//结束时间
        type: "",//栏目
        visible: "",//可视范围
        action: ""//关联啥子
    },
    image:"",
    store:false

};
const defaultState = cloneObject(initialState);
export default function (state = defaultState, action) {
    switch (action.type) {
        case 'EVENT_DISPLAY_INFO_INIT':
            state.info = action.payload;
            if(state.info.begin_at&&state.info.end_at){
                state.info.begin_at= state.info.begin_at.substring(0,10);
                state.info.end_at= state.info.end_at.substring(0,10);
            }else {
                state.info.begin_at = "";
                state.info.end_at = "";
            }
            state.image = action.payload.icon;
            return {
                ...state,
            };
        case 'LOGOUT':
            return window.cloneObject(initialState);
        case 'EVENT_DISPLAY_INFO_CLEAR':
            return window.cloneObject(initialState);
        default:
            return state;
    }
}