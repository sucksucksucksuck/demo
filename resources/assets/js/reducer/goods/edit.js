/**
 * Created by sucksuck on 2017/3/21.
 */
const initialState = {
    //category: [],
    store: false,
    value: {
        id: "",                 //商品id
        title: "",              //商品标题
        category_id: 8,        //商品分类
        type: 0,               //商品属性
        image: [],              //商品图片
        icon: "",               //主图索引
        shelf: "",                //自动上架=>1 手动=>0
        describe: "",           //商品描述
        unit_price: 1,         //单价
        total: 0,              //总需人次
        url: "",                //商品购买链接
        amount: 0,             //实际金额
        sort: "",                //人气值
        sellPrice: 0,
        img_del: [],
        content: "",
        max_periods: 99999,
        periods: 0,
        purchase_volume:[]

    },
    tag: {
        "0": false,
        "1": false,
        "2": false,
    },
    image: [],
    init_length: 0,
    rawImageCount: 0,
    amount: 0,
    form: {
        "delete": [],
        "image": [],
        "main": -1,
        "unit_price": 1,
    }
};

const tag = [
    {
        id: 0,
        title: "hot",
        value: "hot",
    },
    {
        id: 1,
        title: "年货",
        value: "year"
    },
    {
        id: 2,
        title: "当季新品",
        value: "new"
    },
    {
        id: 3,
        title: "tab_hot",
        value: "tab_hot"
    },
    {
        id: 4,
        title: "tab_new",
        value: "tab_new"
    }
];
const defaultState = cloneObject(initialState);
export default function (state = defaultState, action) {
    switch (action.type) {
        case "GOODS_DETAILS_CLEAR":
            return window.cloneObject(initialState);
        case 'GOODS_DETAILS_INIT':
            state.image = action.payload.image;
            state.init_length = action.payload.image.length;
            state.amount = action.payload.total * action.payload.unit_price;
            action.payload.image.forEach(function (item, index) {
                if (item === action.payload.icon) {
                    state.form.main = index;
                }
            });
            if(action.payload.tag){
                action.payload.tag.forEach(function (item, index) {
                    tag.forEach(function (ele, index) {
                        if (item == ele.value) {
                            state.tag[`${ele.id}`] = true;
                        }
                    })
                });
            }
            state.value = action.payload;
            if(!action.payload.purchase_volume.length){
                state.value.purchase_volume = [0,0,0];
            }
            return {
                ...state
            };
        case 'LOGOUT':
            return window.cloneObject(initialState);
        case 'GOODS_CATEGORY_INIT':
            return {...state, category: action.payload};
        default:
            return state;
    }
}
