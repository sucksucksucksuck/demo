/**
 * Created by sucksuck on 2017/6/1.
 */
const initialState = {
    id: "",
    title: "",
    receive_quantity: "",//个数
    type: "3",//类型
    min_amount: "",
    max_amount: "",
    use_amount: "",//使用条件
    expired: "",//有效期
    delayed: "",//延时生效
    chance: "",//权重
    count: "",//次数
    r_count: "",//数量
    amount: "",
    group: "1",
    store: false


};
const defaultState = cloneObject(initialState);
export default function (state = defaultState, action) {
    switch (action.type) {
        case "PRIZE_INFO_CLEAR":
            return window.cloneObject(initialState);
        case 'PRIZE_RED_INFO_INIT':
            state = {...action.payload};
            if (action.payload.min_amount == action.payload.max_amount) {
                state.amount = action.payload.min_amount;
            } else {
                state.amount = action.payload.min_amount + "," + action.payload.max_amount;
            }

            return {
                ...state,
                user_id:""
            };
        case 'LOGOUT':
            return window.cloneObject(initialState);
        default:
            return state;
    }
}