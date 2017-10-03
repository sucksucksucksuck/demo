/**
 * Created by s on 2017/3/13.
 */


const initialState = {
    rows: [],
    search: {user_id: "", goods_id: "", periods: "", order_status: 2, category_id: "",title:"", page: 1},
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
const defaultState = window.cloneObject(initialState);
export default function (state = defaultState, action) {
    switch (action.type) {
        case 'ORDER_ENTITY_INIT':
            return {
                ...state,
                rows: action.payload.rows,
                total: action.payload.total,
                search: {...state.search}
            };
        case 'LOGOUT':
            return window.cloneObject(initialState);
        case 'CATEGORY_INIT':
            return {...state, category: action.payload};
        case 'ADMIN_LIST_INIT':
            return {...state, admin_list: action.payload};
        case 'ORDER_ENTITY_CLEAR':
            return window.cloneObject(initialState);
        default:
            return state;
    }
}
