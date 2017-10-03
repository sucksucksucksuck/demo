const initialState = {
    rows: [],
    search: {user_id: "", type: "", amount: "", pay_no: "", start_time: "", end_time: ""},
    page: 1,
    total: 0,
    statistics: '',
    store: false
};
const defaultState = cloneObject(initialState);
export default function (state = defaultState, action) {
    switch (action.type) {
        case 'PAY_LOG_INIT':
            return {
                ...state,
                rows: action.payload.rows,
                total: action.payload.total,
                search: {...state.search}
            };
        case 'STATISTICS':
            return {
                ...state,
                statistics: action.payload.data
            };
        case 'PAY_LOG_CLEAR':
            return window.cloneObject(initialState);
        default:
            return state;
    }
}
