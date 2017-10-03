/**
 * Created by sucksuck on 2017/4/27.
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
        user_id: "",
        num_sum:"",             //本期该id购买总数
        num:""                 //该订单购买次数
    },
    lucky_codes:[],
    store:false


};

const defaultState = cloneObject(initialState);
export default function (state = defaultState, action) {
    switch (action.type) {
        case "ORDER_DETAILS_CLEAR":
            return window.cloneObject(initialState);
        case 'CUSTOMER_SERVICE_INFO_INIT':
            state.info = {...action.payload};
            return {
                ...state
            };
        case 'LOGOUT':
            return window.cloneObject(initialState);
        case 'LUCKY_CODES_INIT':
            state.lucky_codes= action.payload.rows;
            return {
                ...state
            };
        default:
            return state;
    }
}