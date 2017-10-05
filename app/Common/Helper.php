<?php

namespace App\Common;

use App\Http\Controllers\Event\Common;
use App\Jobs\Lottery;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Mockery\Exception;
use PHPExcel;
use PHPExcel_IOFactory;

/**
 * Created by PhpStorm.
 * User: sun_3211
 * Date: 2017/2/22
 * Time: 17:52
 */
class Helper
{
    /**
     * @param string $str
     * @param bool $uc_first
     * @return string
     */
    static function convertUnderline1($str = null, $uc_first = true)
    {
        if ($str == null || $str == '') {
            return null;
        }
        $str = ucwords(str_replace('_', ' ', $str));
        $str = str_replace(' ', '', lcfirst($str));
        return $uc_first ? ucfirst($str) : $str;
    }

    static function getMillisecond()
    {
        list($t1, $t2) = explode(' ', microtime());
        return (float)sprintf('%.0f', (floatval($t1) + floatval($t2)) * 1000);
    }

    /**
     * post请求
     * @param string $url
     * @param string|array $data
     * @param array $header
     * @param string $cookie_file
     * @param string $type
     * @return string
     */
    static function post($url, $data = null, $header = [], $cookie_file = null, $type = 'html')
    {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows; U; Windows NT 5.1; zh-CN; rv:1.9.1.5) Gecko/20091102 Firefox/3.5.5');
        curl_setopt($ch, CURLOPT_URL, $url);            //设置访问的url地址
        curl_setopt($ch, CURLOPT_HEADER, 0);            //是否显示头部信息
        curl_setopt($ch, CURLOPT_POST, 1);
        if ($data) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
        }
        if ($type == 'json') {
            $header[] = 'Content-Type: application/json; charset=utf-8';
            $header[] = 'Content-Length: ' . strlen($data);
        }
        if ($header) {
            curl_setopt($ch, CURLOPT_HTTPHEADER, $header);
        }
        curl_setopt($ch, CURLOPT_TIMEOUT, 5);           //设置超时
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);      //跟踪301
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);        //返回结果
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        if ($cookie_file) {
            curl_setopt($ch, CURLOPT_COOKIEJAR, $cookie_file);
            curl_setopt($ch, CURLOPT_COOKIEFILE, $cookie_file);
        }
        $content = curl_exec($ch);
        curl_close($ch);
        return $content;
    }

    /**
     * get请求
     * @param string $url
     * @param array $data
     * @param array $header
     * @param string $cookie_file
     * @return string
     */
    static function get($url, $data = [], $header = [], $cookie_file = null)
    {
        $data = http_build_query($data);
        if (strstr($url, '?')) {
            $url = $url . '&' . $data;
        } else {
            $url = $url . '?' . $data;
        }
        //Log::debug('get_url=>' . $url);
//        echo $url;
//        echo '<br />' . "\r\n";
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows; U; Windows NT 5.1; zh-CN; rv:1.9.1.5) Gecko/20091102 Firefox/3.5.5');
        curl_setopt($ch, CURLOPT_URL, $url);            //设置访问的url地址
        curl_setopt($ch, CURLOPT_HEADER, 0);            //是否显示头部信息
        if ($header) {
            curl_setopt($ch, CURLOPT_HTTPHEADER, $header);
        }
        curl_setopt($ch, CURLOPT_TIMEOUT, 5);           //设置超时
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);      //跟踪301
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);        //返回结果
        if ($cookie_file) {
            curl_setopt($ch, CURLOPT_COOKIEJAR, $cookie_file);
            curl_setopt($ch, CURLOPT_COOKIEFILE, $cookie_file);
        }
        $content = curl_exec($ch);
        curl_close($ch);
        return $content;
    }

    /**
     * @param string $phone
     * @param string $msg
     * @param int $type
     * @param array $extend
     * @param string $prefix
     * @param string $cache_name_prefix
     * @return bool
     */
    static function sendSMS($phone, $msg, $type = 4, &$extend = [], $prefix = '【盘古云购】', $cache_name_prefix = 'sms_')
    {
        $cache_key = $cache_name_prefix . $phone;
        $sms = Cache::get($cache_key);
        if ($sms && ($sms['time'] + 60 > time() || $sms['count'] > 5)) {
            if ($sms['time'] + 60 > time()) {
                $extend['difference'] = time() - $sms['time'];
            }
            return false;
        }
        $result = self::dlSMS($phone, $msg, $prefix);
        if ($result['success']) {
            $extend['time'] = time();
            if ($sms) {
                $extend['count'] = $sms['count'] + 1;
            } else {
                $extend['count'] = 1;
            }
            Cache::put($cache_key, $extend, 10);
        }
        DB::table('short_message')->insert([
            'phone' => $phone,
            'message' => $result['msg'],
            'return_message' => $result['result'],
            'type' => $type,
            'extend' => json_encode($extend)
        ]);
        return $result['success'];
    }

    /**
     * 科讯短信
     * @param $phone
     * @param $msg
     * @param string $prefix
     * @return array
     */
    static function xkSMS($phone, $msg, $prefix = '【盘古云购】')
    {
        $message = ($prefix??'【盘古云购】') . $msg;
        $data = ['action' => 'send',
            'userid' => '19',
            'account' => 'whpgygyzm',
            'password' => 'pgyg6688',
            //'password' => '520620',
            'mobile' => $phone,
            'content' => $message,
            'sendTime' => '',
            'extno' => ''];
        $xml = self::post('http://120.76.25.160:7788/sms.aspx', $data);
        // echo $xml;
        if ($xml) {
            $result = simplexml_load_string($xml, 'SimpleXMLElement', LIBXML_NOCDATA);
            // print_r($result);
            //  exit();
            return [
                'msg' => $message,
                'result' => $result->returnstatus,
                'success' => $result->successCounts == 1
            ];
        } else {
            return [
                'msg' => $message,
                'result' => $xml,
                'success' => false
            ];
        }
    }

    /**
     * 科讯短信
     * @param $phone
     * @param $msg
     * @param string $prefix
     * @return array
     */
    static function dlSMS($phone, $msg, $prefix = '【盘古云购】')
    {
        $data = [
            'cdkey' => 'GZDL-C4B31JBZPR',
            'password' => '239886'
        ];
        $xml = self::post('http://116.58.218.56:8080/sdkproxy/regist.action', $data);
        $result = simplexml_load_string(trim($xml), 'SimpleXMLElement', LIBXML_NOCDATA);
        if ($result->error == 0) {
            $send = [
                'phone' => $phone,
                'message' => $msg,
                //'password' => '520620',
                'addserial' => '',
                'seqid' => self::getMillisecond(),
                'smspriority' => '1'
            ];
            $send = array_merge($send, $data);
            $xml = self::post('http://116.58.218.56:8080/sdkproxy/sendsms.action', $send);
            $result = simplexml_load_string(trim($xml), 'SimpleXMLElement', LIBXML_NOCDATA);
        }
        if ($result->error == 0) {
            self::post('http://116.58.218.56:8080/sdkproxy/logout.action', $data);
        }
        return [
            'msg' => $msg,
            'result' => $result->message,
            'success' => $result->error == 0
        ];
    }

    static function password($password)
    {
        return md5($password . config('app.name'));
    }

    static function mima($var)
    {
        $varstr = strlen($var);
        $hash = md5(('#安优企业网站管理系统#中国#' . md5(base64_encode($var . '13yd~!@#$%^&*(){}[500]') . 'Яд Ван 13: Тётя дядя Google Baidu является 50 миллионов улыбка ждет вас' . md5(null) . '독 왕 13: 고모 삼촌 구글 바이 50만 미소 당신을 기다리고' . $var . ']万[{)(*&^%$#@!~13yd') . '@用户中心@统一宇宙' . $varstr) . $varstr);
        return substr($hash, 6, 16);
    }

    static function getNumProcs($filename)
    {
        $data = file_get_contents(config_path('supervisor/queue-' . $filename . '.conf'));
        //  echo $data;
        // Log::debug("getNumProcs.file=$data");
        $rows = explode("\n", $data);
        foreach ($rows as $row) {
            if (strstr(strtolower($row), 'numprocs')) {
                $str = explode('=', $row);
                //  Log::debug("getNumProcs=$row");
                return intval($str[1]);
            }
        }
        return 1;
    }

    static function getMicrotime()
    {
        $a = explode('.', microtime(true) * 10);
        $a[] = 0;
        return str_pad($a[1], 3, '0', STR_PAD_RIGHT);
    }

    static function globalConfig()
    {
        $file_path = config_path('global.json');
        if (file_exists($file_path)) {
            $json = file_get_contents($file_path);
            $config = json_decode($json, true);
            if ($config != null) {
                config(['app.global' => array_merge(config('app.global'), $config)]);
            }
        } else {
            $json = json_encode(config('app.global'));
            file_put_contents($file_path, $json);
        }
        // Log::debug($json);
        return $file_path;
    }

    static function ipToAddress($ip)
    {
        //IP数据文件路径
        $dat_path = resource_path('qqwry.dat');

        //检查IP地址
        if (!preg_match('/^\d{1,3}\\.\d{1,3}\\.\d{1,3}\\.\d{1,3}$/', $ip)) {
            return '不是正确的ip' . $ip;
        }
        if (preg_match("/^(127)/", $ip)) {
            return '本地网络';
        } else if (preg_match("/^(192)/", $ip)) {
            return '局域网';
        }

        //打开IP数据文件
        if (!$fd = @fopen($dat_path, 'rb')) {
            return 'qqwry.dat 文件不存在';
        }

        //分解IP进行运算，得出整形数
        $ip = explode('.', $ip);
        $ipNum = $ip[0] * 16777216 + $ip[1] * 65536 + $ip[2] * 256 + $ip[3];

        //获取IP数据索引开始和结束位置
        $DataBegin = fread($fd, 4);
        $DataEnd = fread($fd, 4);
        $ipBegin = implode('', unpack('L', $DataBegin));
        if ($ipBegin < 0) $ipBegin += pow(2, 32);
        $ipEnd = implode('', unpack('L', $DataEnd));
        if ($ipEnd < 0) $ipEnd += pow(2, 32);
        $ipAllNum = ($ipEnd - $ipBegin) / 7 + 1;

        $BeginNum = 0;
        $EndNum = $ipAllNum;

        //使用二分查找法从索引记录中搜索匹配的IP记录
        $address1num = 0;
        $address2num = 0;
        while ($address1num > $ipNum || $address2num < $ipNum) {
            $Middle = intval(($EndNum + $BeginNum) / 2);
            //偏移指针到索引位置读取4个字节
            fseek($fd, $ipBegin + 7 * $Middle);
            $ipData1 = fread($fd, 4);
            if (strlen($ipData1) < 4) {
                fclose($fd);
                return 'System Error';
            }
            //提取出来的数据转换成长整形，如果数据是负数则加上2的32次幂
            $address1num = implode('', unpack('L', $ipData1));
            if ($address1num < 0) $address1num += pow(2, 32);

            //提取的长整型数大于我们IP地址则修改结束位置进行下一次循环
            if ($address1num > $ipNum) {
                $EndNum = $Middle;
                continue;
            }

            //取完上一个索引后取下一个索引
            $dataSeek = fread($fd, 3);
            if (strlen($dataSeek) < 3) {
                fclose($fd);
                return 'System Error';
            }
            $dataSeek = implode('', unpack('L', $dataSeek . chr(0)));
            fseek($fd, $dataSeek);
            $ipData2 = fread($fd, 4);
            if (strlen($ipData2) < 4) {
                fclose($fd);
                return 'System Error';
            }
            $address2num = implode('', unpack('L', $ipData2));
            if ($address2num < 0) $address2num += pow(2, 32);

            //没找到提示未知
            if ($address2num < $ipNum) {
                if ($Middle == $BeginNum) {
                    fclose($fd);
                    return 'Unknown';
                }
                $BeginNum = $Middle;
            }
        }

        //下面的代码读晕了，没读明白，有兴趣的慢慢读
        $ipFlag = fread($fd, 1);
        if ($ipFlag == chr(1)) {
            $ipSeek = fread($fd, 3);
            if (strlen($ipSeek) < 3) {
                fclose($fd);
                return 'System Error';
            }
            $ipSeek = implode('', unpack('L', $ipSeek . chr(0)));
            fseek($fd, $ipSeek);
            $ipFlag = fread($fd, 1);
        }

        $address1 = '';
        $address2 = '';
        if ($ipFlag == chr(2)) {
            $ipSeek = fread($fd, 3);
            if (strlen($ipSeek) < 3) {
                fclose($fd);
                return 'System Error';
            }
            $ipFlag = fread($fd, 1);
            if ($ipFlag == chr(2)) {
                $ipSeek2 = fread($fd, 3);
                if (strlen($ipSeek2) < 3) {
                    fclose($fd);
                    return 'System Error';
                }
                $ipSeek2 = implode('', unpack('L', $ipSeek2 . chr(0)));
                fseek($fd, $ipSeek2);
            } else {
                fseek($fd, -1, SEEK_CUR);
            }
            while (($char = fread($fd, 1)) != chr(0))
                $address2 .= $char;

            $ipSeek = implode('', unpack('L', $ipSeek . chr(0)));
            fseek($fd, $ipSeek);

            while (($char = fread($fd, 1)) != chr(0))
                $address1 .= $char;
        } else {
            fseek($fd, -1, SEEK_CUR);
            while (($char = fread($fd, 1)) != chr(0))
                $address1 .= $char;

            $ipFlag = fread($fd, 1);
            if ($ipFlag == chr(2)) {
                $ipSeek2 = fread($fd, 3);
                if (strlen($ipSeek2) < 3) {
                    fclose($fd);
                    return 'System Error';
                }
                $ipSeek2 = implode('', unpack('L', $ipSeek2 . chr(0)));
                fseek($fd, $ipSeek2);
            } else {
                fseek($fd, -1, SEEK_CUR);
            }
            while (($char = fread($fd, 1)) != chr(0)) {
                $address2 .= $char;
            }
        }
        fclose($fd);

        //最后做相应的替换操作后返回结果
        if (preg_match('/http/i', $address2)) {
            $address2 = '';
        }
        $address = "$address1($address2)";
        $address = preg_replace('/CZ88.Net/is', '', $address);
        $address = preg_replace('/^s*/is', '', $address);
        $address = preg_replace('/s*$/is', '', $address);
        $address = str_replace('()', '', $address);
        if (preg_match('/http/i', $address) || $address == '') {
            $address = 'Unknown';
        }
        $address = iconv("gb2312", "UTF-8//IGNORE", $address);
        return $address;
    }

    /**
     * 获取用户头像
     * @param $icon
     * @return \Illuminate\Contracts\Routing\UrlGenerator|string
     */
    static function getAvatar($icon)
    {
        if (is_numeric($icon)) {
            return url('/image/avatar/' . $icon . 'gif', [], true);
        }
        return $icon;
    }

    /**
     * 转换带毫秒的时间
     * @param $date
     * @return string
     */
    static function strToTime($date)
    {
        $data = explode('.', $date);
        return strtotime($data[0]) . '.' . $data[1];
    }

    static function lottery($periods_id)
    {
        $p = DB::table('periods')->find($periods_id);
        $l = new Lottery($p);
        $l->handle();
    }

    /**
     * excel导出锁定
     * @param $obj
     */
    static function excelUnlock($obj)
    {
        $value = \Cache::get('excel');
        if ($value && (time() - $value['time']) < 10) {
            throw new \Exception('[' . $value['username'] . '] 正在导出，请稍后再试！！！', 20);
        } else {
            \Cache::put('excel', ['user_id' => $obj->user->id, 'username' => $obj->user->truename, 'time' => time()], 1);
        }
    }

    /**
     * 输出 excel 表格
     * @param array $data 表格数据
     * @param string $fileName 文件名
     * @param string $title 标题
     * @param string $path 服务器存储路径
     * @return void
     */
    static function excelOutput($data = array(), $fileName = '', $title = 'excel', $path = '')
    {
        ini_set('memory_limit', '2048M');
        $objPHPExcel = new PHPExcel();
        // Set document properties
        $objPHPExcel->getProperties()->setCreator("Maarten Balliauw")
            ->setLastModifiedBy("Maarten Balliauw")
            ->setTitle($title)
            ->setSubject("Office 2007 XLSX Test Document")
            ->setDescription("Test document for Office 2007 XLSX, generated using PHP classes.")
            ->setKeywords("office 2007 openxml php")
            ->setCategory("Test result file");

        if ($data) {
            $i = 1;
            foreach ($data as $key => $value) {
                $objPHPExcel->setActiveSheetIndex(0);
                $j = 0;
                foreach ($value as $k => $val) {
                    $col = self::getPExcelCol($j);
                    $index = $col . $i;
                    $objPHPExcel->setActiveSheetIndex(0)->setCellValue($index, $val);
                    //列宽
                    $objPHPExcel->getActiveSheet()->getColumnDimension($col)->setWidth(10);
                    // 加粗
                    //$objPHPExcel->getActiveSheet()->getStyle($index)->getFont()->setBold(true);

                    $j++;
                }
                // 行高
                $objPHPExcel->getActiveSheet()->getRowDimension($i)->setRowHeight(16);

                $i++;
            }
        }

        // Rename worksheet
        if (!$fileName) $fileName = date('Y-m-d', time()) . '.xlsx';
        $objPHPExcel->getActiveSheet()->setTitle($fileName);
        $objPHPExcel->setActiveSheetIndex(0);
        if ($path) {
            $objWriter = PHPExcel_IOFactory::createWriter($objPHPExcel, 'Excel2007');
            $objWriter->save($path . $fileName);
            Cache::forget('excel');
        } else {
            // Redirect output to a client's web browser (Excel2007)
            header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            header('Content-Disposition: attachment;filename="' . $fileName . '"');
            header('Cache-Control: max-age=0');
            $objWriter = PHPExcel_IOFactory::createWriter($objPHPExcel, 'Excel2007');
            $objWriter->save('php://output');
            Cache::forget('excel');
            exit;
        }
    }

    static function getPExcelCol($index)
    {
        $col = intval(ord('A')) + intval($index % 26);
        $col_id = '';
        if ($index >= 26) {
            $col_id = chr(intval(ord('A')) + intval($index / 26) - 1);
        }
        $col_id .= chr($col);
        return $col_id;
    }

    static function payLog($user_id, $amount, $pay_no, $order_no, $type = 1, $pay_type = '')
    {
        $pay_log = DB::table('pay_log')->where(['pay_no' => $pay_no])->first();
        if (!$pay_log) {
            DB::table('pay_log')->insert([
                'user_id' => $user_id,
                'type' => $type,
                'pay_no' => $pay_no,
                'amount' => $amount,
                'order_no' => $order_no,
                'pay_type' => $pay_type
            ]);
            DB::table('user')->where(['id' => $user_id])->update([
                'recharge_amount' => DB::raw("recharge_amount + $amount"),
                'residual_amount' => DB::raw("residual_amount + $amount"),
                'recharge_times' => DB::raw('recharge_times + 1')
            ]);
            Common::recharge($user_id, $amount);
        }
//        $ch = curl_init();
//        curl_setopt($ch, CURLOPT_URL, "http://www.baidu.com");
//        curl_exec($ch);
//        curl_close($ch);
    }

    static function isEmpty(...$params)
    {
        foreach ($params as $p) {
            if (is_string($p)) {
                $p = trim($p);
            }
            if ($p) {
                return $p;
            }
        }
        return '';
    }

    /**
     * 当在期数查询时查询不到对应goods时，增加一期
     * @param $goods_id
     * @param bool $goods
     * @param array $update
     * @param bool $ret
     * @return bool|int
     * @throws \Exception
     */
    static function incrementGoodsPeriods($goods_id, &$goods = false, $update = [], $ret = false)
    {
        if (!$goods) {
            $goods = DB::table('goods')->find($goods_id);
        }
        //status为1,goods未下架
        if ($goods->status == 2) {
            DB::table('goods')->where(['id' => $goods_id])->update(['status' => 3]);
            if ($ret) {
                return false;
            }
            throw new \Exception('商品正在下架', 100);
        }
        if ($goods->status == 3) {
            if ($ret) {
                return false;
            }
            throw new \Exception('商品已经下架', 100);
        }
        // periods的值不能大于max_periods
        if ($goods->periods >= $goods->max_periods) {
            DB::table('goods')->where(['id' => $goods_id])->update(['status' => 3]);
            if ($ret) {
                return false;
            }
            throw new \Exception('商品当前期数不能超出最大期数限定,商品正在下架', 100);
        }
        $periods = DB::table('periods')->where(['goods_id' => $goods->id, 'status' => 1])->orderBy('create_at')->first();
        if ($periods) {
            return $periods->id;
        }
        $goods_periods = DB::table('periods')->where(['goods_id' => $goods->id])->max('periods');
        $goods->periods = $goods->periods + 1;
        if ($goods_periods > $goods->periods) {
            $goods->periods = $goods_periods + 1;
        }
        $periods_id = DB::table('periods')->insertGetId([
            'goods_id' => $goods->{'id'},
            'amount' => $goods->{'amount'},
            'unit_price' => $goods->{'unit_price'},
            'total' => $goods->{'total'},
            'buy' => 0,
            'goods_type' => $goods->{'type'},
            'lottery_type' => $goods->{'lottery_type'},
            'periods' => $goods->periods
        ]);
        $update['periods'] = $goods->periods;
        DB::table('goods')->where(['id' => $goods_id])->update($update);
        return $periods_id;
    }

    /**
     * app传递数据
     * @param string $url
     * @param array $postData
     * @return string
     */
    static function get_data($url, $postData = [])
    {
        $postData = http_build_query($postData);
        $opts = array(
            'http' => array(
                'method' => 'POST',
                'header' => "Host:localhost\r\n" .
                    "Content-Type:application/x-www-form-urlencode\r\n" .
                    "Content-length:" . strlen($postData) . "\r\n",
                'content' => $postData,
            )
        );
        $context = stream_context_create($opts);
        $context = base64_encode(Aes::aesEncrypt($context));
        $data = file_get_contents($url, false, $context);
        return $data;
    }

    /**
     * https获取数据
     */
    static function ssl_get($url, $cacert_url = '')
    {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_USERAGENT, "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1; .NET CLR 1.1.4322; .NET CLR 2.0.50727)");
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
        $contents = curl_exec($ch);
        curl_close($ch);
        return $contents;
    }

    /**
     * 检查ip是否注册过
     */
    static function ip_is_reg($ip, $expire_time = 60)
    {
        $time = date('Y-m-d H:i:s', time() - $expire_time);
        $data = DB::table('user')->where(['ip' => $ip])->where('create_at', '>', $time)->get();
        return empty($data) ? false : true;
    }

    /**
     * url处理
     */
    static function detail_url($name = '')
    {
        return str_replace(array(
            ',',
            '/',
            '，',
            '|',
            '、',
            '\\',
            '*',
            '?',
            '<',
            '>',
            '.',
            "\n",
            "\r",
            '【',
            '】',
            '(',
            ')',
            '：',
            '{',
            '}',
            '\'',
            '"',
            ':',
            ' ',
            ';',
            ' '
        ), '', strtolower($name));
    }

    /**
     * 从字符串中获取url
     */
    static public function get_url($str)
    {
        preg_match('/href=[\"|\']([^\"|\']+)/', $str, $out);
        return $out[1];
    }

    /**
     * 将老数据库vip表的数据插入到user表中
     */
    static public function insertUserByVip($vip)
    {
        if (!$vip) {
            return false;
        }
        DB::table('user')->insert([
            'id' => $vip->uid,
            'type' => $vip->abot,
            'residual_amount' => $vip->jine,
            'last_login_ip' => $vip->ip2,
            'device' => $vip->pt == 'i' ? 1 : 2,
            'create_ip' => $vip->ip,
            'nickname' => $vip->name,
            'icon' => $vip->pic,
            'recharge_amount' => $vip->zcjine,
            'recharge_times' => $vip->chongcount,
            'create_at' => date('Y-m-d H:i:s', $vip->atime),
            'idaf' => $vip->idaf,
            'last_login_at' => date('Y-m-d H:i:s'),
        ]);
        return true;
    }

    /**
     * 获取token
     */
    static public function getToken($user_id)
    {
        $token = md5($user_id . time()) . md5(time());
        return $token;
    }

    /**
     * 检查用户密码
     */
    static public function CheckPassword($password)
    {
        if (preg_match('/^(?![0-9]+$)(?![a-zA-z]+$)[a-zA-Z0-9]{6,20}$/', $password)) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * 将对象里面的数据转换到数组
     * @param array $arr
     * @return array
     * @throws \Exception
     */
    static public function toArray($arr)
    {
        return array_map(function ($item) {
            return get_object_vars($item);
        }, $arr);
    }

    /**
     * base64数据转换成图片
     * @param $base64_data
     * @param $save_dir
     * @param $save_img_name
     * @return \Illuminate\Contracts\Routing\UrlGenerator|string
     */
    static public function Base64ToImg($base64_data, $save_dir, $save_img_name)
    {
        $base64_data = base64_decode($base64_data);
        if (!$save_dir) {
            $save_dir = 'image/user_icon' . date('/Y_m/d/');
        }
        $save_dir2 = public_path($save_dir); //加了/var/www/pgyg/public
        if (!is_dir($save_dir2)) {
            mkdir($save_dir2, 0777, true);
        }
        $file_path = $save_dir2 . $save_img_name;
        file_put_contents($file_path, $base64_data);
        $file = $save_dir . $save_img_name;
        return url($file);
    }

    static public function response($arr)
    {
        $json = json_encode($arr, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        //Log::debug($json);
        return response($json, 200, ['Content-Type' => 'application/json']);
    }

}