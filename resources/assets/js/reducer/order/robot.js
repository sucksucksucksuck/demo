/**
 * Created by sucksuck on 2017/3/20.
 */


const initialState = {
    rows: [],
    search: {user_id: "",id:"",status: "",category:"",page:1},
    page:1,
    total:0,
    category:[],
    store:false
};
const defaultState = cloneObject(initialState);
export default function (state = defaultState, action){
    switch (action.type){
        case 'ROBOT_INIT':
            return{
                ...state,
                rows: action.payload.rows,
                total: action.payload.total,
                search: {...state.search, ...action.payload.state}
            };
        case 'LOGOUT':
            return window.cloneObject(initialState);
        case 'CATEGORY_INIT':
            return {...state, category: action.payload};
        default:
            return state;
    }
}