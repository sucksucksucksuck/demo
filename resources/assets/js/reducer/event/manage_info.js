/**
 * Created by sucksuck on 2017/6/5.
 */
const initialState = {
    id: "",
    title: "",
    begin_at: "",
    end_at: "",
    store: false

};
const defaultState = cloneObject(initialState);
export default function (state = defaultState, action) {
    switch (action.type) {
        case 'MANAGE_INFO_INIT':
            state = {...action.payload};
            if(state.begin_at&&state.end_at){
                state.begin_at= state.begin_at.substring(0,10);
                state.end_at= state.end_at.substring(0,10);
            }else {
                state.begin_at = "";
                state.end_at = "";
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