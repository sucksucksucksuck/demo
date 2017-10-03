/**
 * Created by sucksuck on 2017/5/27.
 */
const initialState = {
    event_info:{},
    rows: [],
    search: {title: "", id: "", type: "", order: "",page:"1"},
    page: 1,
    total: 0,
    store:false
};
const defaultState = cloneObject(initialState);
export default function (state = defaultState, action) {
    switch (action.type) {
        case 'EVENT_PRIZE_LIST_INIT':
            return {
                ...state,
                rows: action.payload.rows,
                total: action.payload.total,
                event_info:action.payload.event_info,
                search: {...state.search, ...action.payload.state}
            };
        case 'EVENT_PRIZE_LIST_CLEAR':
            return window.cloneObject(initialState);
        case 'LOGOUT':
            return window.cloneObject(initialState);
        default:
            return state;
    }
}
