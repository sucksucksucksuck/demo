/**
 * Created by lrx on 2017/7/21.
 */
const initialState = {
    rows: [],
    search: {start_time:"",end_time:"",date_type:1},
    page: 1,
    total:0,
    store:false
};
const defaultState = cloneObject(initialState);
export default function (state = defaultState, action) {
    switch (action.type) {
        case 'TURNTABLE_LEVEL_INIT':
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