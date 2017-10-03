/**
 * Created by sucksuck on 2017/6/29.
 */


const initialState = {
    rows: [],
    user_info: {},
    page_size: "",
    page: 1,
    size: true,
    home_page: true,
    end:false,
    type: 1,
    search: {page: 1, page_size: 20},
    store:false

};
const defaultState = cloneObject(initialState);

export default function (state = defaultState, action) {
    switch (action.type) {
        case 'ADMIN_LOG_INIT':
            if (action.payload.rows.length) {
                state.rows = action.payload.rows;
                state.user_info = action.payload.user_info;
                return {
                    ...state,
                    end: false
                };
            } else {
                state.rows=action.payload.rows;
                state.user_info = action.payload.user_info;
                return {
                    ...state,
                    search: {...state.search}, end: true
                }
            }
        case 'LOGOUT':
            return window.cloneObject(initialState);
        default:
            return state;
    }
}

