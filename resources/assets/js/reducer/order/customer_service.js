/**
 * Created by sucksuck on 2017/4/27.
 */

const initialState = {
    rows: [],
    search: {user_id: "", goods_id: "", periods: "", order_status: "", category_id: "",title:"", status: 1, page: 1},
    user_info: {nickname: "",recharge_amount:"",residual_amount:"",winning_amount:""},
    page: 1,
    total: 0,
    category: [],
    export: false,
    exportAll: false,
    start_time:"",
    end_time:"",
    deliver_start_time:"",
    deliver_end_time:"",
    warn:false,
    warnText:"时间范围只能选取15天以内",
    order_status:"",
    admin_list:[],
    admin_id:"",
    store:false


};
const defaultState = cloneObject(initialState);
export default function (state = defaultState, action) {
    switch (action.type) {
        case 'ORDER_CUSTOMER_SERVICE_SEARCH':
            return {
                ...state,
                rows: action.payload.rows,
                total: action.payload.total,
                search: {...state.search},
                user_info:action.payload.user_info
            };
        case 'LOGOUT':
            return window.cloneObject(initialState);
        case 'CATEGORY_INIT':
            return {...state, category: action.payload};
        case 'ADMIN_LIST_INIT':
            return {...state, admin_list: action.payload};
        default:
            return state;
    }
}