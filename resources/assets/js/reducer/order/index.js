/**
 * Created by sucksuck on 2017/4/6.
 */

const initialState = {
    rows: [],
    search: {
        user_id: "",
        goods_id: "",
        periods: "",
        order_status: "",
        category_id: "",
        title: "",
        page: 1,
        page_size: 20
    },
    user_info: {nickname: "", recharge_amount: "", residual_amount: "", winning_amount: ""},
    page_size: "",
    page: 1,
    category: [],
    end: false,
    confirm: true,
    winning: true,
    size: true,
    type: 2,
    home_page: true,
    create_time: true,
    store: false,
};
const defaultState = cloneObject(initialState);
export default function (state = defaultState, action) {
    switch (action.type) {
        case 'ORDER_ALL_INIT':
            if (action.payload.rows.length) {
                return {
                    ...state,
                    rows: action.payload.rows,
                    search: {...state.search, ...action.payload.state},
                    user_info: action.payload.user_info,
                    end: false
                };
            } else {
                if (state.search.page > 1) {
                    state.search.page = state.search.page - 1;
                }
                return {
                    ...state,
                    search: {...state.search},
                    end: true
                }
            }


        case 'LOGOUT':
            return window.cloneObject(initialState);
        case 'CATEGORY_INIT':
            return {...state, category: action.payload};
        case 'ORDER_ALL_CLEAR':
            return window.cloneObject(initialState);
        default:
            return state;
    }
}