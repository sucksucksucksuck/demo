/**
 * Created by sucksuck on 2017/6/5.
 */
const initialState = {
    id:"",
    info:{},
    store:false

};
const defaultState = cloneObject(initialState);
export default function (state = defaultState, action) {
    switch (action.type) {
        case 'ASSOCIATED_INFO_INIT':
            state.info = {...action.payload};
            return {
                ...state
            };
        case 'LOGOUT':
            return window.cloneObject(initialState);
        default:
            return state;
    }
}