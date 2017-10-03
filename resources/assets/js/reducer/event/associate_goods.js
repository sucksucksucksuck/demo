/**
 * Created by sucksuck on 2017/6/5.
 */
const initialState = {
    id: "",
    category: [],
    goods_list: [],
    item: 1,
    category_checked:"-1",
    category_goods_checked:"-1",
    good_checked:"-1",
    good_periods_checked:"",
    search_text:"",
    info:{},
    store:false

};
const defaultState = cloneObject(initialState);
export default function (state = defaultState, action) {
    switch (action.type) {
        case 'ASSOCIATED_INFO_INIT':
            state.info = {...action.payload};
            if(!action.payload.extend.item){
                state.item = 1;
            }else {
                state.item = action.payload.extend.item;
            }
            if(state.item==1){
                state.category_checked = action.payload.extend.category_id;
            }else if(state.item==2) {
                state.category_goods_checked = action.payload.extend.category_id;
                state.good_checked = action.payload.extend.goods_id;
            }else if(state.item==3) {
                state.search_text = action.payload.extend.search_text;
            }
            return {
                ...state
            };
        case 'ASSOCIATED_GOODS_LIST_INIT':
            state.goods_list = action.payload;
            return {
                ...state
            };
        case 'GOODS_CATEGORY_INIT':
            state.category = action.payload;
            return {
                ...state
            };
        case 'ASSOCIATED_INFO_CLEAR':
            return cloneObject(initialState);
        case 'LOGOUT':
            return window.cloneObject(initialState);
        default:
            return state;
    }
}