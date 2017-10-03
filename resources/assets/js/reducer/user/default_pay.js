

const initialState = {
    rows: [],
    search: {user_id: "", nickname: "", address: "",type:"ali"},
    page: 1,
    total:0,
    store:false
};
const defaultState = cloneObject(initialState);
export default function (state = defaultState, action) {
    switch (action.type) {
        case 'DEFAULT_PAY_INIT':
            return {
                ...state,
                rows: action.payload.rows,
                total: action.payload.total,
                search: {...state.search}
            };
        case 'DEFAULT_PAY_CLEAR':
            return window.cloneObject(initialState);
        default:
            return state;
    }
}
