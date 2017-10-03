const initialState = {
    /*机器人*/
    status: false,
    robot_switch:true,
    bar_left:0,
    goods_buy_count:0,
    win_time: 60,
    /*商品设置*/
    attr_switch: true,
    /*订单*/
    amount_switch: true,
    /*发货金额*/
    money_amounts:[20,30,40],
    filename: "未上传任何文件",
    /*登录密码*/
    msg_switch: true,
    reset_switch: true,
    send_switch: true,
    init_pwd: "123456",
    pwd_type: 1,
    store:false

};
const defaultState = cloneObject(initialState);
export default function (state = defaultState, action) {
    switch (action.type) {
        case 'CONFIG_INIT':
            return {
                ...state,
                robot_switch:action.payload.robot.RobotBuy,
                bar_left:400*((action.payload.robot.BuySpeed)/5),
                goods_buy_count:action.payload.robot.SinglePeopleBuy,
                win_time:action.payload.robot.LotteryWait,
            };
        default:
            return state;
    }
}