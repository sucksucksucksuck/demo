/**
 * Created by sucksuck on 2017/8/9.
 */
const initialState = {
    rows: [],
    search: {id: "", nickname: "",status:"1",phone: "",device:"",remark:"",create_start_time:"",create_end_time:""},
    page: 1,
    total:0,
    store:false,
    uid_type: '',

};
const defaultState = cloneObject(initialState);
export default function (state = defaultState, action) {
    switch (action.type) {
        case 'PG_ANNOUNCEMENT_INIT':
            return {
                ...state,
                rows: action.payload.rows,
                total: action.payload.total,
                search: {...state.search}
            };
        case 'PG_ANNOUNCEMENT_CLEAR':
            return window.cloneObject(initialState);
        default:
            return state;
    }
}
