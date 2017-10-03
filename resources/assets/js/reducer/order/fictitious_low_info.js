/**
 * Created by sucksuck on 2017/6/6.
 */

const initialState = {
    info:{
        icon:"",                //图标
        title:"",               //标题
        periods:"",             //期数id
        unit_price:"",          //单价
        lottery_show_at:"",          //开奖时间
        id:"",                  //订单编号
        status:"",              //开奖结果
        order_status:"",        //订单状态
        num_sum:"",             //本期该id购买总数
        num:"",                 //该订单购买次数
        lucky_code:"",          //中奖夺宝号码
        nickname:"",            //昵称
        user_id:"",             //用户uid
        ip:"",                  //ip
        contact_name:"",        //支付宝姓名
        contact_phone:"",       //收货人联系方式
        payment_channel:"",     //快递公司
        remark:"",              //备注
        contact_id:"",          //支付宝账号
        payment_bank:"",        //打款银行卡尾号
        payment_fee:0,         //手续费
        payment_no:"",          //支付宝流水号
        conversion:true

    },
    lucky_codes:[],
    alipay: [],
    bank:[],
    selected: {alipay:999,bank:999},
    get_code_second: 300,
    store:false
};

const defaultState = cloneObject(initialState);
export default function (state = defaultState, action) {
    switch (action.type) {
        case "ORDER_DETAILS_CLEAR":
            return window.cloneObject(initialState);
        case 'ORDER_FICTITIOUS_LOW_INFO_INIT':
            state.info = {...action.payload};
            state.info.conversion = true;
            return {
                ...state
            };
        case 'LOGOUT':
            return window.cloneObject(initialState);
        case 'LUCKY_CODES_INIT':
            state.lucky_codes= action.payload.rows;
            return {
                ...state
            };
        case 'ORDER_FICTITIOUS_INFO_SAVE':
            return {...state};
        default:
            return state;
    }
}