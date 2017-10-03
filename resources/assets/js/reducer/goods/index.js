/**
 * Created by sucksuck on 2017/3/8.
 */

const initialState = {
    rows: [],
    search: {title: "", id: "", type: "", order: "", status: 1},
    page: 1,
    total: 0,
    category: [],
    export: false,
    exportAll: false,
    category_id_export:" "
};
const defaultState = cloneObject(initialState);
export default function (state = defaultState, action) {
    switch (action.type) {
        case 'GOODS_LIST_INIT':
            return {
                ...state,
                rows: action.payload.rows,
                total: action.payload.total,
                search: {...state.search, ...action.payload.state}
            };
        case 'LOGOUT':
            return window.cloneObject(initialState);
        case 'GOODS_CATEGORY_INIT':
            return {...state, category: action.payload};
        case 'GOODS_CHANGE_STATUS':
            return {
                ...state,
                rows: action.payload.rows,
                total: action.payload.total,
                search: {...state.search, ...action.payload.state}
            };
        case 'GOODS_DELETE':
            return {
                ...state,
                rows: action.payload.rows,
                total: action.payload.total,
                search: {...state.search, ...action.payload.state}
            };
        default:
            return state;
    }
}
