/**
 * Created by sun_3211 on 2017/4/6.
 */

const initialState = {
    single_goods_tip: 0,
    show_total: false,
    single_goods: {},
    total_goods: [],
    goods_list: [],
    goods_list_50: [],
    now_hour: new Date().getHours(),
    appoint: {},
    data_update: [
        {
            recharge_amount: 0,
            consumer_amount: 0,
            winning_amount: 0,
            register:0,
            login:0
        },
        {
            recharge_amount: 0,
            consumer_amount: 0,
            winning_amount: 0,
            register:0,
            login:0
        },
        {
            recharge_amount: 0,
            consumer_amount: 0,
            winning_amount: 0,
            register:0,
            login:0
        }],
    user_info:{
        id:"",
        nickname: "",
        residual_amount: "",
        winning_amount: "",
        recharge_amount: "",
        consumer_amount: "",
    },
    user_data:{
        winning_amount:[],
        consumer_amount:[]
    },
    user_order:{
        rows: [],
        page: 1,
        total: 0,
        search: { page: 1},
    }
};
const defaultState = cloneObject(initialState);
export default function (state = defaultState, action) {
    switch (action.type) {
        case 'MONITOR_GOODS_REFRESH':
            let goods_list = [];
            let goods_list_50 = [];
            for (let i = 0; i < action.payload.monitor.length; i++) {
                goods_list.push(action.payload.monitor[i]);
                let goods = action.payload.selected[`id_${action.payload.monitor[i].goods_id}`];
                if (goods && action.payload.monitor[i].num > (goods.amount / 2)) {
                    goods_list_50.push(action.payload.monitor[i]);
                }
            }
            if (action.payload.periods) {
                state.single_goods[`id_${action.payload.periods.goods_id}`] = action.payload.periods;
            }
            return {
                ...state,
                goods_list: goods_list,
                goods_list_50: goods_list_50,
                now_hour: new Date().getHours(),
                total_goods: action.payload.total_goods
            };
            break;
        case 'MONITOR_GOODS_APPOINT':
            if (!state.appoint) {
                state.appoint = {};
            }
            state.appoint[`id_${action.payload.periods_id}`] = action.payload.user_id;
            return {...state};
        case 'MONITOR_GOODS_CANCEL':
            delete state.appoint[`id_${action.payload.periods_id}`];
            return {...state};
        case 'MONITOR_GOODS_ROBOT':
            if (state.single_goods[`id_${action.payload.goods_id}`].id === action.payload.id) {
                state.single_goods[`id_${action.payload.goods_id}`].lottery_type = action.payload.lottery_type;
            }
            delete state.appoint[`id_${action.payload.id}`];
            return {...state};
        case 'MONITOR_GOODS_ALL':
            if (state.single_goods[`id_${action.payload.goods_id}`].id === action.payload.id) {
                state.single_goods[`id_${action.payload.goods_id}`].lottery_type = action.payload.lottery_type;
            }
            delete state.appoint[`id_${action.payload.id}`];
            return {...state};
        case 'MONITOR_GOODS_SWITCH_PANEL':
            state.show_total = !state.show_total;
            return {...state};
        case 'MONITOR_GOODS_DATA_UPDATE':
            return {
                ...state,
                data_update: action.payload.data
            };
        case 'MONITOR_USER_INFO':
            state.user_info = action.payload.user_info;
            state.user_data = action.payload.user_data;
            return {
                ...state
            };
        case 'MONITOR_USER_ORDER':
            state.user_order = action.payload;
            return {
                ...state
            }
    }
    return state;
}

