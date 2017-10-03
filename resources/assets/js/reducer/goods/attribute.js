/**
 * Created by sucksuck on 2017/3/23.
 */
const initialState = {
    time: [],
    model: [],
    lottery_type: "",
    robot_buy: "",
    id: "",
    icon: "",
    periods_id: "",
    appoint: "",
    robot_buy_setting: {time: [], model: []},
    upSelves:true,
    store:false
};
const defaultState = cloneObject(initialState);
export default function (state = defaultState, action) {
    switch (action.type) {
        case 'GET_EXTEND':
            if(action.payload.status==3) {
                if (!action.payload.robot_buy_setting) {
                    state = {...action.payload};
                    return {
                        ...state,
                        upSelves:true,
                        time: [{end: 24, begin: 0, interval: [30, 120]}],
                        model: [{max: parseInt(action.payload.total/3), min: 1, chance: 100}]
                    }
                } else {
                    state = {
                        ...action.payload,
                        upSelves:true,
                        model: action.payload.robot_buy_setting.model,
                        time: action.payload.robot_buy_setting.time
                    };
                    return {...state};
                }
            }else {
                if (!action.payload.robot_buy_setting) {
                    state = {...action.payload};
                    return {
                        ...state,
                        upSelves:false,
                        time: [{end: 24, begin: 0, interval: [30, 120]}],
                        model: [{max: parseInt(action.payload.total/3), min: 1, chance: 100}]
                    }
                } else {
                    state = {
                        ...action.payload,
                        upSelves:false,
                        model: action.payload.robot_buy_setting.model,
                        time: action.payload.robot_buy_setting.time
                    };
                    return {...state};
                }
            }
        case 'LOGOUT':
            return window.cloneObject(initialState);
        case 'SET_EXTEND':
            return {...state, errcode: action.payload};
        default:
            return state;
    }
}
