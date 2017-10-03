/**
 * Created by sun_3211 on 2017/3/6.
 */
//import title from './title';
const initialState = {
    menu: [],
    active: false,
    // page: {
    //     name: 'Index',
    //     title: title["Index"],
    //     extend: {},
    // },
};
// function toUrl(module, extend) {
//     let url = module.replace(/[A-Z]/g, function (v) {
//         return '/' + v.toLowerCase();
//     });
//     let params = '';
//     if (!(extend instanceof Array) && typeof (extend) === 'object') {
//         for (let key in extend) {
//             let val = extend[key];
//             if (typeof(val) === 'object') {
//                 val = JSON.stringify(val);
//             }
//             params += `&${key}=${decodeURIComponent(val)}`;
//         }
//         if (params) {
//             params = params.replace(/^./, function () {
//                 return "?";
//             })
//         }
//     }
//     return (url + params).substr(1);
// }
const defaultState = cloneObject(initialState);
export default  function (state = defaultState, action) {
    switch (action.type) {
        // case "@@redux/INIT":
        //     if (window.config.isLogin) {
        //         return state;
        //     } else {
        //        // console.log("+++++++++++++");
        //         window.history.replaceState({
        //             name: 'Index',
        //             title: title["Index"],
        //             extend: {},
        //         }, "", window.config.root);
        //         return cloneObject(initialState);
        //     }
        //菜单初始化
        case 'MENU_INIT':
            return {...state, menu: action.payload};
        // case "MENU_SHOW":
        //     return {...state};
        // case 'LOGOUT':
        //     return cloneObject(initialState);
        // case "MENU_ACTIVE":
        //     // window.history.pushState({
        //     //     active: action.payload.id,
        //     //     name: action.payload.module,
        //     //     title: action.payload.title,
        //     //     extend: action.payload.extend
        //     // }, "", window.config.root + toUrl(action.payload.module, action.payload.extend));
        //     return {
        //         ...state,
        //         active: state.active === action.payload ? false : action.payload,
        //         // page: {
        //         //     name: action.payload.module,
        //         //     extend: action.payload.extend,
        //         //     title: action.payload.title
        //         // }
        //     };
        //    // return newState;
        // case "MENU_OPEN":
        //   //  window.history.pushState(action.payload, "", window.config.root + toUrl(action.payload.name, action.payload.extend));
        //     return {
        //         ...state,
        //         page: action.payload
        //     };
        // case "MENU_FORWARD":
        //     // if (!action.payload) {
        //     //     action.payload = {
        //     //         name: 'Index',
        //     //         title: title["Index"],
        //     //         extend: {},
        //     //     }
        //     // }
        //     // return {
        //     //     ...state,
        //     //     page: action.payload
        //     // };
        default:
            return state;
    }
}
