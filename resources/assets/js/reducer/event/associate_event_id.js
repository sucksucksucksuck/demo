/**
 * Created by sucksuck on 2017/6/5.
 */
const initialState = {
    id: "",
    info: {},
    event_list:[],
    store:false

};
const defaultState = cloneObject(initialState);
export default function (state = defaultState, action) {
    switch (action.type) {
        case 'ASSOCIATED_EVENT_INFO_INIT':
            state.info = {...action.payload};
            if(action.payload.extend){
                state.info.event_id = action.payload.extend.event_id;
            }
            return {
                ...state
            };
        case 'EVENT_LIST_INIT':
            state.event_list = action.payload;
            return {
                ...state
            };
        case 'EVENT_LIST_URL_INIT':
            state.event_list = action.payload.rows;
            return {
                ...state
            };
        case 'ASSOCIATED_EVENT_INFO_CLEAR':
            return window.cloneObject(initialState);
        case 'LOGOUT':
            return window.cloneObject(initialState);
        default:
            return state;
    }
}