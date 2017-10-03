/**
 * Created by sucksuck on 2017/3/8.
 */

const initialState = {
    rows: [{id: 1, title: '11', category: '12', amount: '123'}],
    search: {keyword: "", start_time: "", end_time: "", status: 1},
    page: 1,
    total: 0,
    store: false,
    curId: -1,
}
const defaultState = cloneObject(initialState)
export default function (state = defaultState, action) {
    switch (action.type) {
        case 'AGENCY_ALL_LIST':
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
