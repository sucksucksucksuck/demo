/**
 * Created by sucksuck on 2017/7/6.
 */
const initialState = {
    rows: [],
    search: {user_id: "", nickname: "", order: "month_recharge", phone: "", admin_status: 1, director: "", promoters: ""},
    page: 1,
    order: "",
    total: 0,
    store: false,
    statistics: '',
    sumAmount: false,
    day_rank_one: "",
    month_rank_one: "",
    week_rank_one: "",
    sort: "month_recharge"
};
const defaultState = cloneObject(initialState);
export default function (state = defaultState, action) {
    switch (action.type) {
        case 'GROUP_RANK_INIT':
            if (action.payload) {
                state.rows = action.payload.rows;
                state.day_rank_one = action.payload.day_rank_one || "";
                state.month_rank_one = action.payload.month_rank_one || "";
                state.week_rank_one = action.payload.week_rank_one || "";
            }
            return {
                ...state,
                search: {...state.search}
            };
        case 'STATISTICS':
            return {
                ...state,
                sumAmount: true,
                statistics: action.payload
            };
        default:
            return state;
    }
}
