/**
 * Created by lrx on 2017/7/21.
 */
const initialState = {
    rows: [],
    search: {user_id: "", start_time: "", end_time: ""},
    page: 1,
    total: 0,
    red_amount: '',
    pan_amount: '',
    store: false,
    statistics: false
};
const defaultState = cloneObject(initialState);
export default function (state = defaultState, action) {
    switch (action.type) {
        case 'TURNTABLE_LOG_INIT':
            return {
                ...state,
                rows: action.payload.rows,
                total: action.payload.total,
                search: {...state.search}
            };
        case 'TURNTABLE_LOG_STATISTICS':
            return {
                ...state,
                statistics: true,
                red_amount: action.payload.red,
                pan_amount: action.payload.amount
            };
        case 'TURNTABLE_LOG_CLEAR':
            return window.cloneObject(initialState);
        default:
            return state;
    }
}