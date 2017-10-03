/**
 * Created by sucksuck on 2017/6/27.
 */
const initialState = {
    info: {},
    checked: "1",
    admin_group: [],
    data_node:[],
    lock:[],
    store:false
};
const defaultState = cloneObject(initialState);

export default function (state = defaultState, action) {
    switch (action.type) {
        case 'DATA_PERMISSION_INIT':
            state.lock = action.payload.lock;
            state.info = action.payload;
            return {...state};
        case 'ADMIN_ROLE_GROUP_INIT':
            state.admin_group = action.payload;
            return {...state};
        case 'ADMIN_INFO_CLEAR':
            return window.cloneObject(initialState);
        case 'LOGOUT':
            return window.cloneObject(initialState);
        default:
            return state;
    }
}
