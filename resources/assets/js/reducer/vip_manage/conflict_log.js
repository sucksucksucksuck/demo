/**
 * Created by sucksuck on 2017/7/4.
 */
const initialState = {
        rows: [],
        search: {user_id: "", operator_id: "", type: ""},
        page: 1,
        total: 0,
        store: false
    }
;
const defaultState = cloneObject(initialState);
export default function (state = defaultState, action) {
    switch (action.type) {
        case 'CONFLICT_LOG_INIT':
            return {
                ...state,
                rows: action.payload.rows,
                total: action.payload.total,
                search: {...state.search}
            };
        case 'CONFLICT_LOG_CLEAR':
            return window.cloneObject(initialState);
        default:
            return state;
    }
}
