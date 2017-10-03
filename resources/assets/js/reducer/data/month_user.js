/**
 * Created by sucksuck on 2017/6/26.
 */
const initialState = {
    store: false,
    scrollY: 0,
    data: [],
    search: {page: 1},
    newData: [],
    page_size: 40

};
const defaultState = cloneObject(initialState);

export default function (state = defaultState, action) {
    switch (action.type) {
        case 'MONTH_USER_INIT':
            state.newData = action.payload.data.slice(0, state.page_size);
            state.data = action.payload.data;
            return {
                ...state
            };
        case 'LOGOUT':
            return window.cloneObject(initialState);
        default:
            return state;
    }
}

