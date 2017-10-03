/*
 * Created by lrx on 2017/6/2.
 */

const initialState = {
    rows: [],
    search: {id: ""},
    page: 1,
    total:0,
    store:false
};
const defaultState = cloneObject(initialState);
export default function (state = defaultState, action) {
    switch (action.type) {
        case 'PAY_MANAGE_INIT':
            return {
                ...state,
                rows: action.payload.rows,
                total: action.payload.total,
                search: {...state.search}
            };
        case 'CLEAR_DATA':
            return window.cloneObject(initialState);
        default:
            return state;
    }
}
