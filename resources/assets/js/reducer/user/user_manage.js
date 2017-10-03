/*
 * Created by lrx on 2017/5/27.
 */

const initialState = {
    rows: [],
    search: {
        id: "",
        nickname: "",
        phone: "",
        create_ip: "",
        channel: "",
        device: "",
        recharge_times: "",
        create_start_time: "",
        create_end_time: "",
        login_start_time: "",
        login_end_time: "",
    },
    page: 1,
    total: 0,
    store: false,
    warn: false,
    warn_login: false,
    uid_type: '',
};
const defaultState = cloneObject(initialState);
export default function (state = defaultState, action) {
    switch (action.type) {
        case 'USER_MANAGE_INIT':
            state.uid_type="";
            return {
                ...state,
                rows: action.payload.rows,
                total: action.payload.total,
                search: {...state.search}
            };
        case 'ERROR':
            state.uid_type=action.payload;
            return {
                ...state,
                rows:[],
                total:0
            };
        case 'USER_MANAGE_CLEAR':
            return window.cloneObject(initialState);
        default:
            return state;
    }
}
