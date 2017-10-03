/**
 * Created by sucksuck on 2017/5/10.
 */

const initialState = {
    data: {
        date: [],
        recharge_amount: [],
        recharge_people: [],
        recharge_times: []
    },
    store: false,
    search: {
        start_time: "",
        end_time: ""
    },
    warn:false,
    warnText:"请输入正确范围"


};
const defaultState = cloneObject(initialState);

export default function (state = defaultState, action) {
    switch (action.type) {
        case 'PAY_STATISTICS_INIT':
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

