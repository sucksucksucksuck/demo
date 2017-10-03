/**
 * Created by sucksuck on 2017/3/8.
 */

const initialState = {
    rows: [{id: 1, title: '11', category: '12', amount: '123'}],
    search: {title: "", id: "", type: "", order: "", status: 1},
    page: 1,
    total: 0,
    store: false,
}
const defaultState = cloneObject(initialState)
export default function (state = defaultState, action) {
    switch (action.type) {
        case 'USER_WITH_MONEY_LIST':
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
