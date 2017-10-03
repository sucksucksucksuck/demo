/**
 * Created by sucksuck on 2017/7/6.
 */
const initialState = {
    rank_list: [],
    search: {user_id: "", nickname: "", phone: "", tab: 1, director: "", promoters: ""},
    page: 1,
    total: 0,
    store: false,
    statistics: '',
    day_rank_one: "",
    month_rank_one: "",
    week_rank_one: "",
    tab: "1"
};
const defaultState = cloneObject(initialState);
export default function (state = defaultState, action) {
    switch (action.type) {
        case 'PROMOTERS_RANK_INIT':
            return {
                ...state,
                rank_list: action.payload.rank_list,
                search: {...state.search, ...action.payload.state},
                day_rank_one: action.payload.day_rank_one,
                month_rank_one: action.payload.month_rank_one,
                week_rank_one: action.payload.week_rank_one
            };
        case 'PROMOTERS_RANK_CLEAR':
            return cloneObject(initialState);
        default:
            return state;
    }
}
