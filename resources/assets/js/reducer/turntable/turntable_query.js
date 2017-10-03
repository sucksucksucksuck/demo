/**
 * Created by lrx on 2017/7/21.
 */
const initialState = {
    rows: [],
    search: {user_id: "", recharge_amount: "", three_days_recharge_amount: "", count: ""},
    amount: '',
    recharge: '',
    count: '',
    page: 1,
    total: 0,
    store: false,
    user_info: {}
};
const defaultState = cloneObject(initialState);
export default function (state = defaultState, action) {
    switch (action.type) {
        case 'TURNTABLE_QUERY_INIT':
            state.user_info = action.payload;
            return {
                ...state,
            };
        case 'CLEAR_DATA':
            return window.cloneObject(initialState);
        default:
            return state;
    }
}
