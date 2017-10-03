/**
 * Created by sucksuck on 2017/5/5.
 */

const initialState = {
    rows: [],
    search: {operation:"",admin_account: "", periods_id: "",user_id:"",start_time:"",end_time:""},
    page: 1,
    store:false
};
const defaultState = cloneObject(initialState);
export default function (state = defaultState, action) {
    switch (action.type) {
        case 'RECORD_INIT':
            return {
                ...state,
                rows: action.payload.rows,
                total: action.payload.total,
                search: {...state.search,}
            };
        default:
            return state;
    }
}
