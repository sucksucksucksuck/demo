/**
 * Created by sucksuck on 2017/3/8.
 */

const initialState = {
    rows: [],
    search: {title: "", id: "", type: "", order: "", status: 1},
    page: 1,
    total: 0,
    store: false,
}
const defaultState = cloneObject(initialState)
export default function (state = defaultState, action) {
    switch (action.type) {
        case 'AGENCY_RECHARGE_LOG_LIST':
            return {
                ...state,
                rows: action.payload.rows,
                total: action.payload.total,
                search: {...state.search, ...action.payload.state}
            }
        case 'LOGOUT':
            return window.cloneObject(initialState)
        default:
            return state
    }
}
