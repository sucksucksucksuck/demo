/**
 * Created by sucksuck on 2017/6/1.
 */
const initialState = {
    id:"",
    title:"",
    count:"",
    type:"",
    chance:"",
    store:false

};
const defaultState = cloneObject(initialState);
export default function (state = defaultState, action) {
    switch (action.type) {
        case "REISSUE_PRIZE_CLEAR":
            return window.cloneObject(initialState);
        case 'REISSUE_PRIZE_INIT':
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