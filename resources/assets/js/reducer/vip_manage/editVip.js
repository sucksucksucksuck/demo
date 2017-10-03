/**
 * Created by sucksuck on 2017/7/5.
 */
const initialState = {
    id: "",
    user_id: "",
    phone: "",
    admin_id: "",
    wechat: "",
    user_remake: "",
    store: false,
    list: [],
    show:false,
    select:"",
    hover:"",
    filter:false,
    filter_list:[],
    hover_index : -1,
    move:false,
    search: {user_id: "", nickname: "", phone: "", admin_status: 1, director: "", promoters: ""},

};
const defaultState = cloneObject(initialState);
export default function (state = defaultState, action) {
    switch (action.type) {
        case "VIP_INFO_CLEAR":
            return window.cloneObject(initialState);
        case 'VIP_INFO_INIT':
            state = {...action.payload};
            return {
                ...state
            };
        case 'PROMOTERS_LIST_INIT':
            return {
                ...state,
                promoter_list: action.payload,
            };
        case 'VIP_MANAGE_INFO_CLEAR':
            return window.cloneObject(initialState);
        case 'LOGOUT':
            return window.cloneObject(initialState);
        default:
            return state;
    }
}