/**
 * Created by sucksuck on 2017/4/23.
 */


const initialState = {
    store: 'local',
    alipay: [],
    bank:[],
    selected: {alipay:999,bank:999}
};
const defaultState = cloneObject(initialState);
export default function (state = defaultState, action) {
    switch (action.type) {
        case 'MONEY_INFO_SAVE':
            return {
                ...action.payload
            };
        default:
            return state;
    }
    return state;

}
