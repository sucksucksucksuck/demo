<?php
/**
 * Created by PhpStorm.
 * User: xiepeng
 * Date: 2017/6/14
 * Time: 10:52
 */

namespace App\Http\Controllers\Notify;

class JPush
{
    private $app_key;
    private $master_secret;

    function __construct($app_key = '', $master_secret = '') {
        $this->app_key = $app_key;
        $this->master_secret = $master_secret;
    }

    /**
     * 发送
     * @param int $sendno 发送编号
     * @param int $receiver_type 接收者类型。1、指定的IMEI。此时必须指定appKeys。2、tag。3、alias。4、对指定appkey的所有用户推送消息。
     * @param string $receiver_value 发送范围值，与 receiver_type对应。 1、IMEI 2、tag 3、alias 4、不需要填
     * @param int $msg_type 发送消息的类型：1、通知 2、自定义消息
     * @param string $msg_content 发送消息的内容。 与 msg_type 相对应的值
     * @param string $platform 平台类型
     * @return boolean
     */
    public function send($sendno = 0, $receiver_type = 1, $receiver_value = '', $msg_type = 1, $msg_content = '', $platform = 'all'){
        $url = 'https://api.jpush.cn/v3/push';
        $params = '';
        $params .= '&sendno=' . $sendno . '&app_key=' . $this->app_key . '&receiver_type=' . $receiver_type . '&receiver_value=' . $receiver_value;
        $verification_code = md5($sendno . $receiver_type . $receiver_value . $this->master_secret);
        $params .= '&verification_code=' . $verification_code . '&msg_type=' . $msg_type . '&msg_content=' . $msg_content . '&platform=' . $platform;

        $res = $this->post($url, $params);
        if ($res === false) {
            return false;
        }
        $res_arr = json_decode($res, true);
        return $res_arr;
    }

    /**
     * 模拟post进行url请求
     * @param string $url
     * @param string $param
     * @return boolean
     */
    function post($url = '', $param = ''){
        if (empty($url) || empty($param)) {
            return false;
        }
        $base64_auth_string = base64_encode("$this->app_key:$this->master_secret");
        $header = array("Authorization:Basic $base64_auth_string");
        $postUrl = $url;
        $curlPost = $param;
        $ch = curl_init();//初始化curl
        curl_setopt($ch, CURLOPT_URL, $postUrl);//抓取指定网页
        curl_setopt($ch, CURLOPT_HEADER, 0);//设置header
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);//要求结果为字符串且输出到屏幕上
        curl_setopt($ch, CURLOPT_POST, 1);//post提交方式
        curl_setopt($ch, CURLOPT_POSTFIELDS, $curlPost);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $header);
        $data = curl_exec($ch);//运行curl
        curl_close($ch);
        return $data;
    }

}