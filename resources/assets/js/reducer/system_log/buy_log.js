/**
 * Created by lrx on 2017/5/5.
 */

const initialState = {
    rows: [],
    search: {user_id: "", type: "", amount: "",remark:"",start_time:"",end_time:""},
    page: 1,
    total:0,
    statistics:'',
    store:false
};
const defaultState = cloneObject(initialState);
export default function (state = defaultState, action) {
    switch (action.type) {
        case 'BUY_LOG_INIT':
            return {
                ...state,
                rows: action.payload.rows,
                total: action.payload.total,
                search: {...state.search}
            };
        case 'STATISTICS':
            return{
                ...state,
                statistics:action.payload.data
            };
        case 'BUY_LOG_CLEAR':
            return window.cloneObject(initialState);
        default:
            return state;
    }
}
