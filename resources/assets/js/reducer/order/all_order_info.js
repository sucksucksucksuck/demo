/**
 * Created by sucksuck on 2017/4/11.
 */
const initialState = {
    info:{
        amount: "",
        contact_id: "",
        contact_name: "",
        contact_no: "",
        icon: "",
        id: "",
        ip: "",
        num_sum:"",
        lottery_show_at: "",
        lucky_code: "",
        nickname: "",
        order_id: "",
        order_status: "",
        periods: "",
        phone: "",
        status: "",
        title: "",
        unit_price: "",
        user_id: ""
    },
    lucky_codes:[],
    store:false



};

const defaultState = cloneObject(initialState);
export default function (state = defaultState, action) {
    switch (action.type) {
        case 'ALL_ORDER_INFO_INIT':
            state.info = {...action.payload};
            return {
                ...state
            };
        case 'LUCKY_CODES_INIT':
            state.lucky_codes= action.payload.rows;
            return {
                ...state
            };
        case 'LOGOUT':
            return window.cloneObject(initialState);
        default:
            return state;
    }
}