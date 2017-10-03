/*
 * Created by lrx on 2017/5/31.
 */
const initialState = {
    rows: [],
    search: {id: "", nickname: "",status:"1",phone: "",device:"",remark:"",create_start_time:"",create_end_time:""},
    page: 1,
    total:0,
    store:false,
};
const defaultState = cloneObject(initialState);
export default function (state = defaultState, action) {
    switch (action.type) {
        case 'SERVICE_MANAGE_INIT':
            state.uid_type="";
            return {
                ...state,
                rows: action.payload.rows,
                total: action.payload.total,
                search: {...state.search}
            };
        case 'ERROR':
            state.uid_type=action.payload;
            return {
                ...state,
                rows:[],
                total:0
            };
        case 'SERVICE_MANAGE_CLEAR':
            return window.cloneObject(initialState);
        default:
            return state;
    }
}
