/**
 * Created by sucksuck on 2017/7/4.
 */
const initialState = {
    rows: [],
    search: {user_id: "", type: "", amount: "", remark: "", start_time: "", end_time: ""},
    page: 1,
    total: 0,
    store: false
};
const defaultState = cloneObject(initialState);
export default function (state = defaultState, action) {
    switch (action.type) {
        case 'OPERATION_LOG_INIT':
            return {
                ...state,
                rows: action.payload.rows,
                total: action.payload.total,
                search: {...state.search}
            };
        case 'OPERATION_LOG_CLEAR':
            return window.cloneObject(initialState);
        default:
            return state;
    }
}
