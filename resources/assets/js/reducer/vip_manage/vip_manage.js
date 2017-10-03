/**
 * Created by sucksuck on 2017/7/4.
 */

const initialState = {
    rows: [],
    search: {user_id: "", nickname: "", phone: "", admin_status: 1, director: "", promoters: "",option:"全部"},
    page: 1,
    total: 0,
    promoter_list: [],
    director_list: [],
    store: false,
    list: [],
    show:false,
    select:"",
    hover:"",
    filter:false,
    filter_list:[],
    hover_index : -1,
    move:false
};
const defaultState = cloneObject(initialState);
export default function (state = defaultState, action) {
    switch (action.type) {
        case 'VIP_MANAGE_INIT':
            return {
                ...state,
                rows: action.payload.rows,
                total: action.payload.total,
                search: {...state.search}
            };
        case 'PROMOTERS_LIST_INIT':
            return {
                ...state,
                promoter_list: action.payload,
            };
        case 'SECOND_DIRECTOR_LIST_INIT':
            return {
                ...state,
                director_list: action.payload,
            };
        case 'VIP_MANAGE_INIT_CLEAR':
            return window.cloneObject(initialState);
        default:
            return state;
    }
}
