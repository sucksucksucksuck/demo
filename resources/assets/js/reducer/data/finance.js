/**
 * Created by sucksuck on 2017/5/10.
 */

const initialState = {
        data: {
            date: [],
            recharge_amount: [],
            consumer_amount: [],
            winning_amount: [],
            register_ios: [],
            register_android: [],
            login: [],
            virtual_amount: [],
            entity_amount: [],
            recharge_times: [],
            duiba_amount: [],
            real_payment_amount: [],
            real_virtual_amount: [],
            real_entity_amount: [],
            real_duiba_amount: [],
            recharge_people: []
        },
        amount: [],
        real_amount: [],
        fictitious: [],
        real_fictitious: [],
        warn: false,
        warnText: "请输入正确范围",
        search: {
            start_time: "",
            end_time: ""
        },
        store: false

    }
;
const defaultState = cloneObject(initialState);

export default function (state = defaultState, action) {
    switch (action.type) {
        case 'FINANCE_STATISTICS_INIT':
            for (let c in action.payload.virtual_amount) {
                state.amount[c] = parseInt(action.payload.virtual_amount[c]) + parseInt(action.payload.duiba_amount[c]) + parseInt(action.payload.entity_amount[c]);
                state.real_amount[c] = parseInt(action.payload.real_virtual_amount[c]) + parseInt(action.payload.real_duiba_amount[c]) + parseInt(action.payload.real_entity_amount[c]);
                state.fictitious[c] = parseInt(action.payload.virtual_amount[c]) + parseInt(action.payload.duiba_amount[c]);
                state.real_fictitious[c] = parseInt(action.payload.real_virtual_amount[c]) + parseInt(action.payload.real_duiba_amount[c]);
            }
            state.data = action.payload;
            return {
                ...state
            };
        case 'LOGOUT':
            return window.cloneObject(initialState);
        default:
            return state;
    }
}

