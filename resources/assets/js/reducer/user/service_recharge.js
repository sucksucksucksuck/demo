/*
 * Created by lrx on 2017/6/5.
 */

const initialState = {
    rows: [],
    page: 1,
    total:0,
    store:false,
    search:{},
    uid_type:""
};
const defaultState = cloneObject(initialState);
export default function (state = defaultState, action) {
    switch (action.type) {
        case 'SERVICE_RECHARGE_INIT':
            state.uid_type = "";
            return {
                ...state,
                rows: action.payload.rows,
                total: action.payload.total,
                search: {...state.search}
            };
        case 'ERROR':
            state.uid_type=action.payload;
            return {
                ...state
            };
        case 'CLEAR_DATA':
            return window.cloneObject(initialState);
        default:
            return state;
    }
}
