/**
 * Created by sucksuck on 2017/8/10.
 */
const initialState = {
    store: false,
    info: {
        visible: "1"
    },
    event_list: [],
    image: "",
};
const defaultState = cloneObject(initialState);
export default function (state = defaultState, action) {
    switch (action.type) {
        case 'PG_ANNOUNCEMENT_INFO_INIT':
            return {
                ...state,
                info: action.payload,
                image: action.payload.icon
            };
        case 'EVENT_LIST_INIT':
            state.event_list = action.payload;
            return {
                ...state
            };
        case 'PG_ANNOUNCEMENT_INFO_CLEAR':
            return window.cloneObject(initialState);
        default:
            return state;
    }
}
