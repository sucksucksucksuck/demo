/**
 * Created by sucksuck on 2017/7/11.
 */
const initialState = {
    rows: [],
    search: {user_id: "", goods_id: "", periods: "", category_id: "",title:"", page: 1},
    page: 1,
    total: 0,
    category: [],
    order_status:"",
    payment_type: 0,
    store:false,
    checkbox:true
};
const defaultState = window.cloneObject(initialState);
export default function (state = defaultState, action) {
    switch (action.type) {
        case 'SHARE_ORDER_LIST_INIT':
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
        case 'ROBOT_CLEAR':
            return window.cloneObject(initialState);
        default:
            return state;
    }
}
