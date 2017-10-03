/**
 * Created by sucksuck on 2017/5/26.
 */

const initialState = {
    list: [],
    prize_type: {
        "1": false,
        "2": false,
        "3": false,
        "4": false,
        "5": false
    },
    user_type:{
        "0": false,
        "4": false,
        "2": false
    },
    export_event: {
        event_id: "",
        prize_type: [],
        start_time: "",
        end_time: "",
        user_type: []
    },
    export_rank: {
        event_id: ""
    },
    store:false

};
const defaultState = cloneObject(initialState);
export default function (state = defaultState, action) {
    switch (action.type) {
        case 'EVENT_LIST_INIT':
            return {
                ...state,
                list: action.payload,
            };
        case 'LOGOUT':
            return window.cloneObject(initialState);
        default:
            return state;
    }
}
