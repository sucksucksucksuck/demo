/**
 * Created by sucksuck on 2017/10/3 19:59.
 */
const initialState = {
    date: {},
    store: false,
}
const defaultState = cloneObject(initialState)
export default function (state = defaultState, action) {

    switch (action.type) {
        case 'AGENCY_INFO_INIT':
            return {
                data: {...action.payload}
            }
        case 'LOGOUT':
            return window.cloneObject(initialState)
        default:
            return state
    }
}
