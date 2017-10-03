/**
 * Created by sucksuck on 2017/3/20.
 */


const initialState = {
    rows: [{
        "id": 37315,
        "user_id": 7522,
        "lottery_at": "2017-03-18 14:07:07",
        "unit_price": 1,
        "lucky_code": 10000019,
        "buy": 429,
        "status": 3,
        "periods": 415,
        "order_status": 1,
        "title": "未中奖",
        "icon": "/temp/image/20160424/20160424143425_66139.jpg",
        "nickname": "甜甜甜甜辣酱"
    }],
    search: {user_id: "", id: "", status: "", category: "", page: 1},
    page: 1,
    total: 0,
    category: [],
    store:false
};
const defaultState = cloneObject(initialState);
export default function (state = defaultState, action) {
    switch (action.type) {
        case 'NOT_WINNING_INIT':
            return {
                ...state,
                rows: action.payload.rows,
                total: action.payload.total,
                search: {...state.search, ...action.payload.state}
            };
        case 'LOGOUT':
            return window.cloneObject(initialState);
        case 'CATEGORY_INIT':
            return {...state, category: action.payload};
        default:
            return state;
    }
}