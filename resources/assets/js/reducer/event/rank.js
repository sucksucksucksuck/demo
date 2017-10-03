/**
 * Created by sucksuck on 2017/6/2.
 */
const initialState = {
    event_info: {},
    rows: [],
    search: {title: "", id: "", type: "", order: "",event_id:""},
    page: 1,
    total: 0,
    btn: true,
    event_list:[],
    rank:{},
    store:false

};
const defaultState = cloneObject(initialState);
export default function (state = defaultState, action) {
    switch (action.type) {
        case 'EVENT_LIST_INIT':
            return {
                ...state,
                event_list: action.payload
            };
        case 'RANK_LIST_INIT':
            return {
                ...state,
                rows: action.payload.rows,
                event_info: action.payload.event_info,
                search: {...state.search, ...action.payload.state},
            };
        case 'LOGOUT':
            return window.cloneObject(initialState);
        default:
            return state;
    }
}
