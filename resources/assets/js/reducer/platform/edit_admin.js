/**
 * Created by sucksuck on 2017/5/3.
 */

const initialState = {
    admin_info:{
        icon:"",
        employee_id:"",
        truename:"",
        account:"",
        phone:"",
        group_id:"",
        status:1,
        sex:""
    },
    admin_group:[],
    store:false

};
const defaultState = cloneObject(initialState);

export default function (state = defaultState, action){
    switch (action.type){
        case 'ADMIN_INFO_INIT':
            state.admin_info = action.payload;
            return {...state};
        case 'ADMIN_ROLE_GROUP_INIT':
            state.admin_group = action.payload;
            return {...state};
        case 'LOGOUT':
            return window.cloneObject(initialState);
        case 'ADMIN_INFO_CLEAR':
            return window.cloneObject(initialState);
        default:
            return state;
    }
}
