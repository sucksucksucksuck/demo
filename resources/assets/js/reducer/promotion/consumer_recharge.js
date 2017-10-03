/**
 * Created by sucksuck on 2017/7/6.
 */

const initialState = {
    rows: [],
    search: {user_id: "", nickname: "", phone: "", admin_status: 1, director: "", promoters: ""},
    page: 1,
    total: 0,
    info: {
        day_recharge: "",
        month_recharge: "",
        recharge_amount: "",
        week_recharge: ""
    },
    store:false

};
const defaultState = cloneObject(initialState);
export default function (state = defaultState, action) {
    switch (action.type) {
        case 'CONSUMER_RECHARGE_INIT':
            state.rows=action.payload.rows;
            state.total=action.payload.total;
            return {
                ...state,
                search: {...state.search}
            };
        case 'CONSUMER_RECHARGE_INFO':
            state.info = action.payload;
            return {
                ...state,
            };
        case 'CONSUMER_RECHARGE_CLEAR':
            return cloneObject(initialState);
        default:
            return state;
    }
}
