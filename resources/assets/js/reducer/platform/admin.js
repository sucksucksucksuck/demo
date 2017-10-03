
const initialState = {
    rows: [],
    search: {employee_id: "", status: ""},
    page: 1,
    total: 0,
    user:{
        id:"",
        icon:"",
        truename:"",
        account:"",
        phone:""
    },
    bigPermisson: [],
    check: {},
    admin_group:[],
    level:0,
    id:"",
    checkbox:false,
    obj:{},
    option:[],
    store:false

};
const defaultState = cloneObject(initialState);

export default function (state = defaultState, action){
    switch (action.type){
        case 'PLATFORM_ADMIN_INIT':
            return {
                ...state,
                rows: action.payload.rows,
                total: action.payload.total,
                search: {...state.search}
            };
        case 'LOGOUT':
            return window.cloneObject(initialState);
        case 'ADMIN_INFO_EDIT':{
            return{
                ...state,
                user:action.payload.user
            }
        }
        case 'ADMIN_PERMISSION_LIST':
            if (action.payload.check instanceof Array) {
                action.payload.check = {};
            }
            return {
                ...state,
                bigPermisson: action.payload.list,
                check: action.payload.check,
            };
        case 'ADMIN_ROLE_GROUP_INIT':

            state.admin_group = action.payload;
            return {...state};
        default:
            return state;
    }
}

