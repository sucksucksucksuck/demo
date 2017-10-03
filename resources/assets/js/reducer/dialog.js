/**
 * Created by sun_3211 on 2017/3/6.
 */
const initialState = {
    dialog: {},
    count: 0,
    store: false
};
const defaultState = cloneObject(initialState);

export default function (state = defaultState, action) {
    switch (action.type) {
        //菜单初始化
        case 'DIALOG_OPEN':
            if (!state.dialog[action.payload.key]) {
                state.dialog[action.payload.key] = action.payload;
                state.count++;
                return {...state};
            }
            return state;
        case "DIALOG_CLOSE":
            // if (state.dialog[action.payload.key]) {
            //     state.dialog[action.payload.key].open = false;
            // }
            if (state.dialog[action.payload]) {
                delete state.dialog[action.payload];
                state.count--;
                return {...state};
            }
            return state;
        case 'DIALOG_CLOSE_ALL':
            // for (let key of state.dialog) {
            //     state.dialog[key].open = false;
            // }
            state.dialog = {};
            state.count = 0;
            return {...state};
        default:
            return state;
    }
}

