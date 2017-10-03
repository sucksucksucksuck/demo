/**
 * Created by sucksuck on 2017/7/11.
 * 晒单详情
 */
const initialState = {
    image: [],
    form: {
        "delete": [],
        "image": [],
    },
    data:"",
    store:false,
};
const defaultState = window.cloneObject(initialState);
export default function (state = defaultState, action) {
    switch (action.type) {
        case 'SHARE_ORDER_INFO_INIT':
            state.data = action.payload;
            return {
                ...state,
                content:action.payload.content,
                image: action.payload.image,
            };
        case 'LOGOUT':
            return window.cloneObject(initialState);
        case 'CATEGORY_INIT':
            return {...state, category: action.payload};
        case 'SHARE_ORDER_INFO_CLEAR':
            return window.cloneObject(initialState);
        default:
            return state;
    }
}
