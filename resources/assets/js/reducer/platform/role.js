/**
 * Created by sucksuck on 2017/4/24.
 */

const initialState = {
    bigPermisson: [],
    roleList: [],
    check: {},
    selected: -1,
    store:false
};
const defaultState = cloneObject(initialState);

export default function (state = defaultState, action) {
    switch (action.type) {
        case 'PERMISSION_LIST':
            if (action.payload.check instanceof Array) {
                action.payload.check = {};
            }
            return {
                ...state,
                bigPermisson: action.payload.list,
                check: action.payload.check,
                selected:action.payload.select
            };
        case 'ROLE_LIST':
            return {
                ...state,
                roleList: action.payload
            };
        default:
            return state;
    }
}

