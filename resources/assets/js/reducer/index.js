/**
 * Created by sun_3211 on 2017/2/16.
 */
export auth from './auth'
export menu from './menu/index'
export dialog from './dialog'
export goods from './goods'
export goodsEdit from './goods/edit'
export goodsAttribute from './goods/attribute'

export orderEntity from './order/entity'
export orderEntityInfo from './order/entity_info'
export orderFictitious from './order/fictitious'
export orderFictitiousInfo from './order/fictitious_info'
export orderExchange from './order/exchange'
export orderExchangeInfo from './order/exchange_info'
export orderWinning from './order/winning'
export orderWinningInfo from './order/winning_info'
export order from './order'
export allOrderInfo from './order/all_order_info'
export orderCustomer from './order/customer_service'
export orderCustomerInfo from './order/customer_service_info'
export orderFictitiousLow from './order/fictitious_low'
export orderFictitiousLowInfo from './order/fictitious_low_info'

export orderRobot from './order/robot'
export notWinning from './order/notwinning'

export platformAdmin from './platform/admin'
export createAdmin from './platform/create_admin'
export editAdmin from './platform/edit_admin'
export platformRole from './platform/role'
export dataPermission from './platform/data_permission'
export adminLog from './platform/admin_log'

export monitorGoods from './monitor/goods'
export monitorGoodsSetting from './monitor/setting'
export monitorGoodsStatus from './monitor/status'
export monitorAppointWinning from './monitor/appoint_winning'
export monitorQuickPurchaseSetting from './monitor/quick_purchase'

export systemLogBuyLog from './system_log/buy_log'
export systemLogPayLog from './system_log/pay_log'
export systemLogPrizeLog from './system_log/prize_log'

export moneyInfo from './auth/money_info'

export dataProfile from './data/profile'
export dataPay from './data/pay'
export dataFinance from './data/finance'
export dataMonthUser from './data/month_user'

//活动管理
export eventDisplay from './event/display'
export eventDisplayInfo from './event/display_info'
export eventManage from './event/manage'
export eventDataExport from './event/data_export'
export eventPrizeSetting from './event/prize_setting'
export prizeAssets from './event/prize_assets'
export prizeGoods from './event/prize_goods'
export prizeRed from './event/prize_red'
export prizeAssetsInfo from './event/prize_assets_info'
export prizeGoodsInfo from './event/prize_goods_info'
export prizeRedInfo from './event/prize_red_info'
export reissuePrize from './event/reissue_prize'
export manageInfo from './event/manage_info'
export rank from './event/rank'
export associateContent from './event/associate_content'
export associateEventId from './event/associate_event_id'
export associateGoods from './event/associate_goods'
export associateUrl from './event/associate_url'
export weekRechargeRank from './event/week_recharge_rank'

export systemConfig from './system/system_config'
export appConfig from './system/app_config'
export appVersion from './system/app_version'

//用户管理
export userManage from './user/user_manage'
export serviceManage from './user/service_manage'
export defaultPay from './user/default_pay'
export rechargeManage from './user/recharge_manage'
export serviceRecharge from './user/service_recharge'

//转盘管理
export turntableQuery from './turntable/turntable_query'
export turntableLog from './turntable/turntable_log'
export turntableDay from './turntable/turntable_day'
export turntableLevel from './turntable/turntable_level'

//VIP客户管理
export vipManage from './vip_manage/vip_manage'
export editVip from './vip_manage/editVip'
export conflictLog from './vip_manage/conflict_log'
export operationLog from './vip_manage/operation_log'

//业绩推广
export consumerRecharge from './promotion/consumer_recharge'
export groupRank from './promotion/group_rank'
export promotersPerformance from './promotion/promoters_performance'
export promotersRank from './promotion/promoters_rank'

//晒单管理
export robot from './share_order/robot'
export shareInfo from './share_order/share_info'
export shareOrderList from './share_order/share_order_list'

//消息管理
export pgAnnouncement from './message_manage/pg_announcement'
export pgAnnouncementInfo from './message_manage/create_announcement'
export pushMessage from './message_manage/push_message'
export stationMessage from './message_manage/station_message'

//代理
export coinLog from './agency/coin_log'
export rechargeLog from './agency_all/recharge_log'

export agencyList from './agency_all/list'

export userwithdrawalList from './user_withdrawal/list'
export passList from './user_withdrawal/passList'
export unPassList from './user_withdrawal/unpassList'
export moneyList from './user_withdrawal/money'

export userList from './user_manage/list'
export userRechargeList from './user_manage/rechargeList'
export agencyDetails from './agency_all/agency_details'
export financeRecharge from './finance/recharge'