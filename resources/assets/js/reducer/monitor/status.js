/**
 * Created by sun_3211 on 2017/4/14.
 */


const initialState = {
    rows: [],
    search: {title: "", id: "", type: "", order: "", status: 1},
    page: 1,
    total: 0,
    category: [],
    export: false,
    exportAll: false,
    store:false

};
const defaultState = cloneObject(initialState);
export default function (state = defaultState, action) {
    switch (action.type) {
        case 'GOODS_STATUS_LIST_INIT':
            return {
                ...state,
                rows: action.payload.rows,
                total: action.payload.total,
                search: {...state.search, ...action.payload.state}
            };
        case 'LOGOUT':
            return window.cloneObject(initialState);
        case 'GOODS_CATEGORY_INIT':
            return {...state, category: action.payload, store: false};
        default:
            return state;
    }
}
