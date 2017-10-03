/**
 * Created by lrx on 2017/7/21.
 */
const initialState = {
    rows: [],
    search: {start_time:"",end_time:""},
    page: 1,
    total:0,
    store:false
};
const defaultState = cloneObject(initialState);
export default function (state = defaultState, action) {
    switch (action.type) {
        case 'TURNTABLE_DAY_INIT':
            return {
                ...state,
                rows: action.payload.rows,
                total: action.payload.total,
                search: {...state.search}
            };

        default:
            return state;
    }
}