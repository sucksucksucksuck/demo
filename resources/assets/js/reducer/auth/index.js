/**
 * Created by sun_3211 on 2017/2/16.
 */
const initialState = {
    errcode: -1,
    store: false,
    form: {
        user_id: "",
        user_pwd: "",
        captcha: "",
        verify_code: "",
        remember: false
    },
    get_code_flag: false,
    get_code_second: 60,
    sms_validity: true,
    msg: false
}
const defaultState = window.cloneObject(initialState)

export default function (state = defaultState, action) {
    try {
        switch (action.type) {
            // case "@@redux/INIT":
            // return cloneObject(initialState);
            case 'AUTH_LOGIN_SUCCESS':
                return {errcode: 0, store: 'session', user: action.payload}
            case 'AUTH_LOGIN_FAIL':
                return {...state, store: false, errcode: 1, sms_validity: true, msg: action.payload}
            case 'LOGOUT':
                window.socketApi.logout()
                let newState = cloneObject(initialState)
                if (action.payload) {
                    newState.msg = action.payload
                }
                return newState
            case 'AUTH_LOGIN_SMS_SEND_SUCCESS':
                return {...state, errcode: 101, sms_validity: true, store: false, msg: ""}
            case 'AUTH_LOGIN_SMS_SEND_FAIL':
                let data = {
                    ...state,
                    errcode: 1,
                    sms_validity: false,
                    get_code_flag: false,
                    get_code_second: 60,
                    msg: action.payload.msg,
                    store: false
                }
                if (action.payload.data.difference < 60) {
                    data.get_code_flag = true
                    data.get_code_second = 60 - action.payload.data.difference
                }
                return data
            default:
                return state
        }
    } catch (e) {
        console.log(e)
    }
}
