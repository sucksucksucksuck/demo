/**
 * Created by sucksuck on 2017/7/6.
 */
const initialState = {
    rows: [],
    search: {
        user_id: "", nickname: "", phone: "", admin_status: "1", director: "", promoters: "", option: "全部", page: 1,
        page_size: 10000,order: "month_recharge",
    },
    sort: "month_recharge",
    order: "",
    page: 1,
    total: 0,
    store: false,
    statistics: "",
    sumAmount: false,
    info: {
        day_recharge: "",
        month_recharge: "",
        recharge_amount: "",
        week_recharge: ""
    },
    list: [],
    show: false,
    promoter_list: [],
    director_list: [],
    select: "",
    hover: "",
    filter: false,
    filter_list: [],
    hover_index: -1,
    move: false
};
const defaultState = cloneObject(initialState);
export default function (state = defaultState, action) {
    switch (action.type) {
        case 'PROMOTERS_PERFORMANCE_INIT':
            return {
                ...state,
                rows: action.payload.rows,
                total: action.payload.total,
                search: {...state.search}
            };
        case 'PROMOTERS_PERFORMANCE_INFO':
            return {
                ...state,
                info: action.payload,
            };
        case 'PROMOTERS_PERFORMANCE_SUM_AMOUNT':
            return {
                ...state,
                sumAmount: true,
                statistics: action.payload
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
        default:
            return state;
    }
}
