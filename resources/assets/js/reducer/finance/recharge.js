/**
 * Created by sucksuck on 2017/10/2 18:13.
 */
const initialState = {
    data: {
        bus_account: "",
        bus_id: "",
        coins: "",
        created_at: "",
        email: "",
        phone: "",
        qq: "",
        wechat: "",
    },
    form: {},
    store: false,
}
const defaultState = cloneObject(initialState)
export default function (state = defaultState, action) {

    switch (action.type) {
        case 'FINANCE_RECHARGE':
            return {
                ...state,
                data: {...action.payload}
            }
        case 'CLEAR':
            return window.cloneObject(initialState)
        case 'LOGOUT':
            return window.cloneObject(initialState)
        default:
            return state
    }
}
