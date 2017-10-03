import React from 'react'
import {Route} from 'react-router-dom'
import Index from './index_page'


// import Order from './order';
// import OrderWinning from'./order/winning';
// import OrderEntity from './order/entity';
// import OrderFictitious from './order/fictitious';
// import OrderExchange from './order/exchange';
// import OrderFictitiousLow from './order/fictitious_low';

// import OrderEntityInfo from './order/entity_info';
// import OrderFictitiousInfo from './order/fictitious_info';
// import OrderFictitiousLowInfo from './order/fictitious_low_info';
// import OrderExchangeInfo from './order/exchange_info';
// import OrderWinningInfo from './order/winning_info';
// import AllOrderInfo from './order/all_order_info';
// import CustomerService from './order/customer_service';
// import CustomerServiceInfo from './order/customer_service_info';

// import UserManage from './user/user_manage';
// import ServiceManage from './user/service_manage';
// import DefaultPay from './user/default_pay';
// import RechargeManage from './user/recharge_manage';
// import ServiceRecharge from './user/service_recharge';

// import SystemConfig from './system/system_config';
// import AppConfig from './system/app_config';
// import AppVersion from './system/app_version';
// import ReleaseConfig from './system/release_config';
// import MonitorConfig from './system/monitor_config';


// import RobotList from './order/robot';
// import NotWinningList from './order/notWinning';
// import OrderShare from './order/share';


// import MonitorGoods from './monitor/goods';
// import GoodsStatus from './monitor/status';
// import AppointWinning from './monitor/appoint_winning';
//
// import SystemBuyLog from './system_log/buy_log';
// import SystemPayLog from './system_log/pay_log';
// import SystemPrizeLog from './system_log/prize_log';
//


// import EventDisplay from './event/display';
// import EventDisplayInfo from './event/display_info';
// import EventManage from './event/manage';
// import EventPrizeSetting from './event/prize_setting';
// import EventDataExport from './event/data_export';
// import EventCount from './event/count'
// import WeekRechargeRank from './event/week_recharge_rank';
//
// import VipManage from './vip_manage/vip_manage';
// import ConflictLog from './vip_manage/conflict_log';
// import OperationLog from './vip_manage/operation_log';
//
// import ConsumerRecharge from './promotion/consumer_recharge';
// import GroupRank from './promotion/group_rank';
// import PromotersPerformance from './promotion/promoters_performance';
// import PromotersRank from './promotion/promoters_rank';
//
// import Robot from './share_order/robot';
// import ShareOrderList from './share_order/share_order_list';
//
// import PrizeAssets from './event/prize_assets';
// import PrizeGoods from './event/prize_goods';
// import PrizeRed from './event/prize_red';
// import Rank from './event/rank';
// import TurntableQuery from './turntable/turntable_query'
// import TurntableLog from './turntable/turntable_log'
// import TurntableDay from './turntable/turntable_day'
// import TurntableLevel from './turntable/turntable_level'

// import PgAnnouncement from './message_manage/pg_announcement';
// import PushMessage from './message_manage/push_message';
// import StationMessage from './message_manage/station_message';

// import Goods from './goods'//100
// import GoodsEdit from './goods/edit'//101
// import GoodsAttribute from './goods/attribute'

import Admin from './platform/admin'
import Role from './platform/role'
import AdminLog from './platform/admin_log'

import DataProfile from './data/profile'
import DataPay from './data/pay'
import DataFinance from './data/finance'
import DataMonthUser from './data/month_user'

import Error from './../error'
import AgencyDetails from './agency/agency_details'
import Recharge from './agency/recharge'
import CoinLog from './agency/coin_log'
import AddAgency from './agency_all/add_agency'
import AgencyList from './agency_all/list'
import RechargeLog from './agency_all/recharge_log'
import UserWithdrawalList from './user_withdrawal/list'
import UserWithdrawalPassList from './user_withdrawal/passList'
import UserWithdrawalUnPassList from './user_withdrawal/unpassList'
import UserWithdrawalMoney from './user_withdrawal/money'
import UserManageList from './user_manage/list'
import UserManageRechargeList from './user_manage/rechargeList'
import FinanceRecharge from './finance/recharge'


export default class extends React.Component {
    constructor(props) {
        super(props)
    }

    activeTabContent(TabContent, route) {
        return <TabContent {...route.match.params}/>
    }


    render() {
        return <div className="tap-content">
            <Route exact path={window.caseUrl("/")}
                   component={this.activeTabContent.bind(this, Index)}/>
            {/*银商代理*/}
            <Route exact path={window.caseUrl("/agency/agencyDetails/:extend")}
                   component={this.activeTabContent.bind(this, AgencyDetails)}/>
            <Route exact path={window.caseUrl("/agency/recharge/:extend")}
                   component={this.activeTabContent.bind(this, Recharge)}/>
            <Route exact path={window.caseUrl("/coin/index/:extend")}
                   component={this.activeTabContent.bind(this, CoinLog)}/>
            {/*总银商代理*/}
            <Route exact path={window.caseUrl("/agency/addAgency/:extend")}
                   component={this.activeTabContent.bind(this, AddAgency)}/>
            <Route exact path={window.caseUrl("/agency/list/:extend")}
                   component={this.activeTabContent.bind(this, AgencyList)}/>
            <Route exact path={window.caseUrl("/agency/rechargeLog/:extend")}
                   component={this.activeTabContent.bind(this, RechargeLog)}/>
            {/*用户提现管理*/}
            <Route exact path={window.caseUrl("/userWithdrawal/list/:extend")}
                   component={this.activeTabContent.bind(this, UserWithdrawalList)}/>
            <Route exact path={window.caseUrl("/userWithdrawal/passList/:extend")}
                   component={this.activeTabContent.bind(this, UserWithdrawalPassList)}/>
            <Route exact path={window.caseUrl("/userWithdrawal/unpassList/:extend")}
                   component={this.activeTabContent.bind(this, UserWithdrawalUnPassList)}/>
            <Route exact path={window.caseUrl("/userWithdrawal/money/:extend")}
                   component={this.activeTabContent.bind(this, UserWithdrawalMoney)}/>
            {/*用户管理*/}
            <Route exact path={window.caseUrl("/userManage/list/:extend")}
                   component={this.activeTabContent.bind(this, UserManageList)}/>
            <Route exact path={window.caseUrl("/userManage/rechargeList/:extend")}
                   component={this.activeTabContent.bind(this, UserManageRechargeList)}/>
            {/*财务管理*/}
            <Route exact path={window.caseUrl("/finance/recharge/:extend")}
                   component={this.activeTabContent.bind(this, FinanceRecharge)}/>
            {/*数据分析*/}
            <Route exact path={window.caseUrl("/data/info/:extend")}
                   component={this.activeTabContent.bind(this, DataProfile)}/>
            <Route exact path={window.caseUrl("/data/pay/:extend")}
                   component={this.activeTabContent.bind(this, DataPay)}/>
            <Route exact path={window.caseUrl("/data/finance/:extend")}
                   component={this.activeTabContent.bind(this, DataFinance)}/>
            <Route exact path={window.caseUrl("/data/month_user/:extend")}
                   component={this.activeTabContent.bind(this, DataMonthUser)}/>
            {/*管理员*/}
            <Route exact path={window.caseUrl("/admin/:extend")}
                   component={this.activeTabContent.bind(this, Admin)}/>
            <Route exact path={window.caseUrl("/admin/role/:extend")}
                   component={this.activeTabContent.bind(this, Role)}/>
            <Route exact path={window.caseUrl("/admin/log/:extend")}
                   component={this.activeTabContent.bind(this, AdminLog)}/>
            {/*error*/}
            <Route exact path={window.caseUrl("/error")}
                   component={this.activeTabContent.bind(this, Error)}/>

            {/*商品*/}
            {/*<Route exact path={window.caseUrl("/goods/:extend")}*/}
            {/*component={this.activeTabContent.bind(this, Goods)}/>*/}
            {/*<Route exact path={window.caseUrl("/goods/info/:extend")}*/}
            {/*component={this.activeTabContent.bind(this, GoodsEdit)}/>*/}
            {/*<Route exact path={window.caseUrl("/goods/extend/:extend")}*/}
            {/*component={this.activeTabContent.bind(this, GoodsAttribute)}/>*/}
            {/*订单*/}
            {/*<Route exact path={window.caseUrl("/order/winning/:extend")}*/}
            {/*component={this.activeTabContent.bind(this, OrderWinning)}/>*/}
            {/*<Route exact path={window.caseUrl("/order/entity/:extend")}*/}
            {/*component={this.activeTabContent.bind(this, OrderEntity)}/>*/}
            {/*<Route exact path={window.caseUrl("/order/fictitious/:extend")}*/}
            {/*component={this.activeTabContent.bind(this, OrderFictitious)}/>*/}
            {/*<Route exact path={window.caseUrl("/order/fictitious/low/:extend")}*/}
            {/*component={this.activeTabContent.bind(this, OrderFictitiousLow)}/>*/}
            {/*<Route exact path={window.caseUrl("/order/customer_service/:extend")}*/}
            {/*component={this.activeTabContent.bind(this, CustomerService)}/>*/}
            {/*<Route exact path={window.caseUrl("/order/exchange/:extend")}*/}
            {/*component={this.activeTabContent.bind(this, OrderExchange)}/>*/}
            {/*<Route exact path={window.caseUrl("/order/:extend")}*/}
            {/*component={this.activeTabContent.bind(this, Order)}/>*/}
            {/*<Route exact path={window.caseUrl("/order/fictitious/info/:extend")}*/}
            {/*component={this.activeTabContent.bind(this, OrderFictitiousInfo)}/>*/}
            {/*<Route exact path={window.caseUrl("/order/fictitious/low/info/:extend")}*/}
            {/*component={this.activeTabContent.bind(this, OrderFictitiousLowInfo)}/>*/}
            {/*<Route exact path={window.caseUrl("/order/fictitious/exchange/info/:extend")}*/}
            {/*component={this.activeTabContent.bind(this, OrderExchangeInfo)}/>*/}
            {/*<Route exact path={window.caseUrl("/order/entity/info/:extend")}*/}
            {/*component={this.activeTabContent.bind(this, OrderEntityInfo)}/>*/}
            {/*<Route exact path={window.caseUrl("/order/winning/info/:extend")}*/}
            {/*component={this.activeTabContent.bind(this, OrderWinningInfo)}/>*/}
            {/*<Route exact path={window.caseUrl("/order/info/:extend")}*/}
            {/*component={this.activeTabContent.bind(this, AllOrderInfo)}/>*/}
            {/*<Route exact path={window.caseUrl("/order/customer_service/info/:extend")}*/}
            {/*component={this.activeTabContent.bind(this, CustomerServiceInfo)}/>*/}

            {/*数据监控*/}
            {/*<Route exact path={window.caseUrl("/monitor/goods/:extend")}*/}
            {/*component={this.activeTabContent.bind(this, MonitorGoods)}/>*/}
            {/*<Route exact path={window.caseUrl("/monitor/status/:extend")}*/}
            {/*component={this.activeTabContent.bind(this, GoodsStatus)}/>*/}
            {/*<Route exact path={window.caseUrl("/monitor/appoint_winning/:extend")}*/}
            {/*component={this.activeTabContent.bind(this, AppointWinning)}/>*/}

            {/*系统日志*/}
            {/*<Route exact path={window.caseUrl("/system_log/buy_log/:extend")}*/}
            {/*component={this.activeTabContent.bind(this, SystemBuyLog)}/>*/}
            {/*<Route exact path={window.caseUrl("/system_log/pay_log/:extend")}*/}
            {/*component={this.activeTabContent.bind(this, SystemPayLog)}/>*/}
            {/*<Route exact path={window.caseUrl("/system_log/prize_log/:extend")}*/}
            {/*component={this.activeTabContent.bind(this, SystemPrizeLog)}/>*/}

            {/*活动管理*/}
            {/*<Route exact path={window.caseUrl("/event/display/:extend")}*/}
            {/*component={this.activeTabContent.bind(this, EventDisplay)}/>*/}
            {/*<Route exact path={window.caseUrl("/event/display/info/:extend")}*/}
            {/*component={this.activeTabContent.bind(this, EventDisplayInfo)}/>*/}
            {/*<Route exact path={window.caseUrl("/event/manage/:extend")}*/}
            {/*component={this.activeTabContent.bind(this, EventManage)}/>*/}
            {/*<Route exact path={window.caseUrl("/event/manage/prize/setting/:extend")}*/}
            {/*component={this.activeTabContent.bind(this, EventPrizeSetting)}/>*/}
            {/*<Route exact path={window.caseUrl("/event/manage/data/export/:extend")}*/}
            {/*component={this.activeTabContent.bind(this, EventDataExport)}/>*/}
            {/*<Route exact path={window.caseUrl("/event/manage/prize/assets/:extend")}*/}
            {/*component={this.activeTabContent.bind(this, PrizeAssets)}/>*/}
            {/*<Route exact path={window.caseUrl("/event/manage/prize/goods/:extend")}*/}
            {/*component={this.activeTabContent.bind(this, PrizeGoods)}/>*/}
            {/*<Route exact path={window.caseUrl("/event/manage/prize/red/:extend")}*/}
            {/*component={this.activeTabContent.bind(this, PrizeRed)}/>*/}
            {/*<Route exact path={window.caseUrl("/event/manage/rank/:extend")}*/}
            {/*component={this.activeTabContent.bind(this, Rank)}/>*/}
            {/*<Route exact path={window.caseUrl("/event/count/:extend")}*/}
            {/*component={this.activeTabContent.bind(this, EventCount)}/>*/}
            {/*<Route exact path={window.caseUrl("/event/recharge_rank/:extend")}*/}
            {/*component={this.activeTabContent.bind(this, WeekRechargeRank)}/>*/}

            {/*系统管理*/}
            {/*<Route exact path={window.caseUrl("/system/system_config/:extend")}*/}
            {/*component={this.activeTabContent.bind(this, SystemConfig)}/>*/}
            {/*<Route exact path={window.caseUrl("/system/app_config/:extend")}*/}
            {/*component={this.activeTabContent.bind(this, AppConfig)}/>*/}
            {/*<Route exact path={window.caseUrl("/system/app_version/:extend")}*/}
            {/*component={this.activeTabContent.bind(this, AppVersion)}/>*/}
            {/*<Route exact path={window.caseUrl("/system/release_config/:extend")}*/}
            {/*component={this.activeTabContent.bind(this, ReleaseConfig)}/>*/}
            {/*<Route exact path={window.caseUrl("/system/monitor_config/:extend")}*/}
            {/*component={this.activeTabContent.bind(this, MonitorConfig)}/>*/}

            {/*用户管理*/}
            {/*<Route exact path={window.caseUrl("/user/user_manage/:extend")}*/}
            {/*component={this.activeTabContent.bind(this, UserManage)}/>*/}
            {/*<Route exact path={window.caseUrl("/user/service_manage/:extend")}*/}
            {/*component={this.activeTabContent.bind(this, ServiceManage)}/>*/}
            {/*<Route exact path={window.caseUrl("/user/default_pay/:extend")}*/}
            {/*component={this.activeTabContent.bind(this, DefaultPay)}/>*/}
            {/*<Route exact path={window.caseUrl("/user/recharge_manage/:extend")}*/}
            {/*component={this.activeTabContent.bind(this, RechargeManage)}/>*/}
            {/*<Route exact path={window.caseUrl("/user/service_recharge/:extend")}*/}
            {/*component={this.activeTabContent.bind(this, ServiceRecharge)}/>*/}

            {/*vip客户*/}
            {/*<Route exact path={window.caseUrl("/vip_manage/:extend")}*/}
            {/*component={this.activeTabContent.bind(this, VipManage)}/>*/}
            {/*<Route exact path={window.caseUrl("/vip_manage/conflict_log/:extend")}*/}
            {/*component={this.activeTabContent.bind(this, ConflictLog)}/>*/}
            {/*<Route exact path={window.caseUrl("/vip_manage/operation_log/:extend")}*/}
            {/*component={this.activeTabContent.bind(this, OperationLog)}/>*/}

            {/*业绩推广*/}
            {/*<Route exact path={window.caseUrl(" /performance/consumer_recharge/:extend")}*/}
            {/*component={this.activeTabContent.bind(this, ConsumerRecharge)}/>*/}
            {/*<Route exact path={window.caseUrl(" /performance/promoters_performance/:extend")}*/}
            {/*component={this.activeTabContent.bind(this, PromotersPerformance)}/>*/}
            {/*<Route exact path={window.caseUrl("/performance/promoters_rank/:extend")}*/}
            {/*component={this.activeTabContent.bind(this, PromotersRank)}/>*/}
            {/*<Route exact path={window.caseUrl("/performance/group_rank/:extend")}*/}
            {/*component={this.activeTabContent.bind(this, GroupRank)}/>*/}

            {/*晒单管理*/}
            {/*<Route exact path={window.caseUrl("/share_order/share_order_list/:extend")}*/}
            {/*component={this.activeTabContent.bind(this, ShareOrderList)}/>*/}
            {/*<Route exact path={window.caseUrl("/share_order/robot/:extend")}*/}
            {/*component={this.activeTabContent.bind(this, Robot)}/>*/}

            {/*转盘管理*/}
            {/*<Route exact path={window.caseUrl("/turntable/turntable_query/:extend")}*/}
            {/*component={this.activeTabContent.bind(this, TurntableQuery)}/>*/}
            {/*<Route exact path={window.caseUrl("/turntable/turntable_log/:extend")}*/}
            {/*component={this.activeTabContent.bind(this, TurntableLog)}/>*/}
            {/*<Route exact path={window.caseUrl("/turntable/turntable_day/:extend")}*/}
            {/*component={this.activeTabContent.bind(this, TurntableDay)}/>*/}
            {/*<Route exact path={window.caseUrl("/turntable/turntable_level/:extend")}*/}
            {/*component={this.activeTabContent.bind(this, TurntableLevel)}/>*/}

            {/*消息管理*/}
            {/*<Route exact path={window.caseUrl("/message_manage/push_message/:extend")}*/}
            {/*component={this.activeTabContent.bind(this, PushMessage)}/>*/}
            {/*<Route exact path={window.caseUrl("/message_manage/station_message/:extend")}*/}
            {/*component={this.activeTabContent.bind(this, StationMessage)}/>*/}
            {/*<Route exact path={window.caseUrl("/message_manage/pg_announcement/:extend")}*/}
            {/*component={this.activeTabContent.bind(this, PgAnnouncement)}/>*/}


        </div>
    }
}
