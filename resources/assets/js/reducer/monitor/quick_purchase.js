/**
 * Created by sucksuck on 2017/7/26.
 */

const initialState = {
    store: 'local',
    goods: [],
    selected: {},
    search:false,
    result:[],
    value:""
};
const defaultState = cloneObject(initialState);
export default function (state = defaultState, action) {
    switch (action.type) {
        case 'QUICK_PURCHASE_SETTING_DATA':
            return {
                ...state,
                goods: action.payload
            };
        case 'QUICK_PURCHASE_SETTING_SELECTED':
            if (state.selected[`id_${action.payload.id}`]) {
                delete state.selected[`id_${action.payload.id}`];
            } else {
                action.payload.index = 99999;
                state.selected[`id_${action.payload.id}`] = action.payload;
            }
            return {
                ...state
            };
        default:
            return state;
    }
    return state;
}
