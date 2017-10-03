/**
 * Created by sucksuck on 2017/5/27.
 */
const initialState = {
    rows: [],
    search: {title: "", id: "", type: "", order: "",status:""},
    page: 1,
    total: 0,
    event_info:{},
    store:false

};
const defaultState = cloneObject(initialState);
export default function (state = defaultState, action) {
    switch (action.type) {
        case 'EVENT_PRIZE_ASSETS_INIT':
            return {
                ...state,
                event_info:action.payload.event_info,
                rows: action.payload.rows,
                total: action.payload.total,
                search: {...state.search, ...action.payload.state}
            };
        case 'LOGOUT':
            return window.cloneObject(initialState);
        default:
            return state;
    }
}