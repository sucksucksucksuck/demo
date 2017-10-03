/**
 * Created by sucksuck on 2017/4/9.
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
        contact_name:"",        //收货人姓名
        contact_phone:"",       //收货人联系方式
        contact_id:"",          //收货地址
        payment_channel:"",     //快递公司
        payment_no:"",          //快递单号
        remark:"",              //备注
        amount:"",              //商品实际金额
        url:"",                 //商品购买链接
        conversion:true
    },
    lucky_codes:[],
    store:false




};

const defaultState = cloneObject(initialState);
export default function (state = defaultState, action) {
    switch (action.type) {
        case "ORDER_DETAILS_CLEAR":
            return window.cloneObject(initialState);
        case 'ORDER_ENTITY_INFO_INIT':
            state.info = {...action.payload};
            state.info.conversion = true;

            return {
                ...state
            };
        case 'LOGOUT':
            return window.cloneObject(initialState);
        case 'ORDER_ENTITY_INFO_SAVE':
            state.info = {...action.payload};
            return {
                ...state
            };
        case 'LUCKY_CODES_INIT':
            state.lucky_codes= action.payload.rows;
            return {
                ...state
            };
        default:
            return state;
    }
}