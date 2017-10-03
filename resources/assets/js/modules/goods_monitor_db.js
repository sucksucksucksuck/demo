/**
 * Created by sun_3211 on 2017/4/10.
 */
export default class {
    constructor() {
        try {
            this.db = window.openDatabase(window.config.dbName, '1.0', '订单监控', 1024 * 1024);
        } catch (e) {
            console.error('请使用谷歌浏览器!');
        }
    }

    createGoods() {
        return new Promise(function (resolve, reject) {
            if (!this.db) {
                reject({conn: null, message: "未创建连接"});
                return;
            }
            this.db.transaction(function (conn) {
                conn.executeSql('CREATE TABLE IF NOT EXISTS goods(id INTEGER PRIMARY KEY,title TEXT,amount INTEGER,unit_price INTEGER,total INTEGER,sort INTEGER)', [],
                    function (conn, result) {
                        resolve({conn: conn, result: result});
                    },
                    function (conn, message) {
                        reject({conn: conn, message: message});
                    });
            });
        }.bind(this));
    }

    createMonitor() {
        return new Promise(function (resolve, reject) {
            if (!this.db) {
                reject({conn: null, message: "未创建连接"});
                return;
            }
            this.db.transaction(function (conn) {
                conn.executeSql('CREATE TABLE IF NOT EXISTS monitor(id INTEGER PRIMARY KEY,periods_id INTEGER,user_id INTEGER,user_type INTEGER,nickname TEXT,goods_id INTEGER,title TEXT,periods INTEGER,num INTEGER,create_at DATETIME,total_buy INTEGER,total_winning INTEGER,today_buy INTEGER,today_winning INTEGER)', [],
                    function (conn, result) {
                        let date = new Date();
                        date.setDate(date.getDate() - 1);
                        conn.executeSql('DELETE FROM monitor WHERE create_at < ?', [date.format('yyyy-MM-dd hh:mm:ss')]);
                        resolve({conn: conn, result: result});
                    },
                    function (conn, message) {
                        reject({conn: conn, message: message});
                    });
            });
        }.bind(this));
    }

    insert(data, tableName) {
        return new Promise(function (resolve, reject) {
            if (!this.db) {
                reject({conn: null, message: "未创建连接"});
                return;
            }
            this.db.transaction(function (conn) {
                let key = [];
                let placeholder = [];
                let value = [];
                for (let k in data) {
                    key.push(k);
                    placeholder.push('?');
                    value.push(data[k]);
                }
                key = key.join(',');
                placeholder = placeholder.join(',');
                conn.executeSql(`INSERT INTO ${tableName} (${key}) VALUES (${placeholder})`, value,
                    function (conn, result) {
                        resolve({conn: conn, result: result});
                    },
                    function (conn, message) {
                        reject({conn: conn, message: message});
                    });
            });
        }.bind(this));
    }

    insertMonitor(data) {
        return this.insert(data, 'monitor');
    }

    insertGoods(data) {
        return this.insert(data, 'goods');
    }

    selectMonitor(goods_id, data = {}) {
        return new Promise(function (resolve, reject) {
            if (!this.db) {
                reject({conn: null, message: "未创建连接"});
                return;
            }
            this.db.transaction(function (conn) {
                conn.executeSql(`SELECT *
                                 FROM monitor
                                 WHERE goods_id IN (${goods_id.join(",")})
                                 ORDER BY create_at
                                   DESC
                                 LIMIT 100`, []
                    , function (conn, result) {
                        data.conn = conn;
                        data.monitor = result.rows;
                        resolve(data);
                    },
                    function (conn, message) {
                        reject({conn: conn, message: message});
                    }
                );
            });
        }.bind(this));
    }

    getPeriodsUser(periods_id, data = {}) {
        return new Promise(function (resolve, reject) {
            if (!this.db) {
                reject({conn: null, message: "未创建连接"});
                return;
            }
            this.db.transaction(function (conn) {
                conn.executeSql('SELECT user_id,sum(num) AS num,nickname,user_type FROM monitor WHERE periods_id = ? GROUP BY user_id,nickname,user_type ORDER BY sum(num) DESC', [periods_id],
                    function (conn, result) {
                        let user = [];
                        for (let i = 0; i < result.rows.length; i++) {
                            user.push(result.rows[i]);
                        }
                        data.conn = conn;
                        data.user = user;
                        resolve(data);
                    },
                    function (conn, message) {
                        reject({conn: conn, message: message});
                    }
                );
            });
        }.bind(this));
    }

    getGoodsSum(begin, end, goods_id) {
        return new Promise(function (resolve, reject) {
            if (!this.db) {
                reject({conn: null, message: "未创建连接"});
                return;
            }
            this.db.transaction(function (conn) {
                conn.executeSql(`SELECT
                                   sum(num) AS num,
                                   goods_id
                                 FROM monitor
                                 WHERE create_at < ? AND create_at > ? AND goods_id IN (${goods_id.join(",")})
                                 GROUP BY goods_id`,
                    [begin, end],
                    function (conn, result) {
                        resolve({conn: conn, rows: result.rows});
                    },
                    function (conn, message) {
                        reject({conn: conn, message: message});
                    });
            });
        }.bind(this));
    }

    getTotalGoods(data = {}) {
        let goods_id = [];
        let total_goods = [];
        let selected = window.store.getState().monitorGoodsSetting.selected;
        for (let key in selected) {
            goods_id.push(selected[key].id);
            let goods = {
                title: selected[key].title,
                amount: selected[key].amount,
                goods_id: selected[key].id,
                now: 0,
                up_1_hour: 0,
                up_2_hour: 0,
                up_3_hour: 0
            };
            total_goods.push(goods);
        }
        let now = new Date();
        let begin = now.format('yyyy-MM-dd hh:mm;ss');
        now.setHours(now.getHours() - 1);
        let end = now.format('yyyy-MM-dd hh:mm;ss');
        return new Promise(function (resolve, reject) {
            this.getGoodsSum(begin, end, goods_id)
                .then(function (result) {
                    for (let i = 0; i < total_goods.length; i++) {
                        for (let j = 0; j < result.rows.length; j++) {
                            if (total_goods[i].goods_id === result.rows[j].goods_id) {
                                total_goods[i].now = result.rows[j].num;
                            }
                        }
                    }
                    begin = now.format('yyyy-MM-dd hh:00;00');
                    now.setHours(now.getHours() - 1);
                    end = now.format('yyyy-MM-dd hh:00;00');
                    return this.getGoodsSum(begin, end, goods_id);
                }.bind(this))
                .then(function (result) {
                    for (let i = 0; i < total_goods.length; i++) {
                        for (let j = 0; j < result.rows.length; j++) {
                            if (total_goods[i].goods_id === result.rows[j].goods_id) {
                                total_goods[i].up_1_hour = result.rows[j].num;
                            }
                        }
                    }
                    begin = now.format('yyyy-MM-dd hh:00;00');
                    now.setHours(now.getHours() - 1);
                    end = now.format('yyyy-MM-dd hh:00;00');
                    return this.getGoodsSum(begin, end, goods_id);
                }.bind(this))
                .then(function (result) {
                    for (let i = 0; i < total_goods.length; i++) {
                        for (let j = 0; j < result.rows.length; j++) {
                            if (total_goods[i].goods_id === result.rows[j].goods_id) {
                                total_goods[i].up_2_hour = result.rows[j].num;
                            }
                        }
                    }
                    begin = now.format('yyyy-MM-dd hh:00;00');
                    now.setHours(now.getHours() - 1);
                    end = now.format('yyyy-MM-dd hh:00;00');
                    return this.getGoodsSum(begin, end, goods_id);
                }.bind(this))
                .then(function (result) {
                    for (let i = 0; i < total_goods.length; i++) {
                        for (let j = 0; j < result.rows.length; j++) {
                            if (total_goods[i].goods_id === result.rows[j].goods_id) {
                                total_goods[i].up_3_hour = result.rows[j].num;
                            }
                        }
                    }
                    begin = now.format('yyyy-MM-dd hh:00;00');
                    now.setHours(now.getHours() - 1);
                    end = now.format('yyyy-MM-dd hh:00;00');
                    return this.getGoodsSum(begin, end, goods_id);
                }.bind(this))
                .then(function (result) {
                    for (let i = 0; i < total_goods.length; i++) {
                        for (let j = 0; j < result.rows.length; j++) {
                            if (total_goods[i].goods_id === result.rows[j].goods_id) {
                                total_goods[i].up_4_hour = result.rows[j].num;
                            }
                        }
                    }
                    data.conn = result.conn;
                    data.total_goods = total_goods;
                    resolve(data);
                }.bind(this))
                .catch(function (result) {
                    reject(result);
                });
        }.bind(this));
    }
}
// data