/**
 * Created by sucksuck on 2017/7/28.
 */
const initialState = {
    rows: [],
    search: {user_id: "", start_time:"",end_time:""},
    page: 1,
    total:0,
    store:false,
    rank_list:[]

};
const defaultState = cloneObject(initialState);
export default function (state = defaultState, action) {
    switch (action.type) {
        case 'RECHARGE_RANK_INIT':
            return {
                ...state,
                rows: action.payload.rows,
                total: action.payload.total,
                search: {...state.search, ...action.payload.state}
            };
        case 'RANK_PERIODS_INIT':
            return {
                ...state,
                rank_list: action.payload,
            };
        default:
            return state;
    }
}