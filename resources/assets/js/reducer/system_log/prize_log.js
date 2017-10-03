/**
 * Created by sucksuck on 2017/6/9.
 */
const initialState = {
    rows: [],
    search: {user_id: "", type: "", amount: "", event_id: "", start_time: "", end_time: "", remark: ""},
    page: 1,
    total: 0,
    statistics: '',
    event_list: [],
    store: false
};
const defaultState = cloneObject(initialState);
export default function (state = defaultState, action) {
    switch (action.type) {
        case 'PRIZE_LOG_INIT':
            return {
                ...state,
                rows: action.payload.rows,
                total: action.payload.total,
                search: {...state.search}
            };
        case 'EVENT_LIST_INIT':
            state.event_list = action.payload;
            return {
                ...state
            };
        case 'STATISTICS':
            return {
                ...state,
                statistics: action.payload.data
            };
        case 'PRIZE_LOG_CLEAR':
            return window.cloneObject(initialState);
        default:
            return state;
    }
}
