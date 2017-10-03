/**
 * Created by lrx on 2017/7/11.
 */
const initialState = {
    filename:"未上传任何文件",
    ios_show:true,
    ios_version:'',
    store:false
};
const defaultState = cloneObject(initialState);
export default function (state = defaultState, action) {
    switch (action.type) {
        case 'VERSION_INIT':
            return {
                ...state,
                ios_version:action.payload
            };
        default:
            return state;
    }
}