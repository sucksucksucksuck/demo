/**
 * Created by sucksuck on 2017/4/25.
 */

const initialState = {
    data: [{
        consumer_amount: 0,
        date: "",
        duiba_amount: 0,
        entity_amount: "",
        login: 0,
        real_duiba_amount: 0,
        real_entity_amount: 0,
        real_payment_amount: 0,
        real_virtual_amount: 0,
        recharge_amount: 0,
        recharge_times: 0,
        register_android: 0,
        register_ios: 0,
        virtual_amount: "0",
        winning_amount: "0"
    },
        {
            consumer_amount: 0,
            date: "",
            duiba_amount: 0,
            entity_amount: "",
            login: 0,
            real_duiba_amount: 0,
            real_entity_amount: 0,
            real_payment_amount: 0,
            real_virtual_amount: 0,
            recharge_amount: 0,
            recharge_times: 0,
            register_android: 0,
            register_ios: 0,
            virtual_amount: "0",
            winning_amount: "0"
        }],
    info: [],
    store: false


};
const defaultState = cloneObject(initialState);

export default function (state = defaultState, action) {
    switch (action.type) {
        case 'DATA_PROFILE_INIT':
            if (action.payload instanceof Array) {
                state.data = action.payload;
            }
            return {
                ...state
            };
        case 'LOGOUT':
            return window.cloneObject(initialState);
        default:
            return state;
    }
}

