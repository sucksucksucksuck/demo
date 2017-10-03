/**
 * Created by sucksuck on 2017/6/1.
 */
const initialState = {
    id: "",
    title: "",
    count: "",
    type: "1",
    chance: "",
    group: "1",
    store:false


};
const defaultState = cloneObject(initialState);
export default function (state = defaultState, action) {
    switch (action.type) {
        case "PRIZE_INFO_CLEAR":
            return window.cloneObject(initialState);
        case 'PRIZE_GOODS_INFO_INIT':
            state = {...action.payload};
            return {
                ...state
            };
        case 'LOGOUT':
            return window.cloneObject(initialState);
        default:
            return state;
    }
}