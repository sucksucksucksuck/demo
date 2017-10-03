/**
 * Created by sun_3211 on 2017/4/6.
 */
import echarts from 'echarts';

export default function (progress, periods, title,canvas) {
    let ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.arc(50, 50, 45, 0, 2 * Math.PI, false);
    ctx.lineWidth = 10;
    ctx.strokeStyle = "#BCC1CC";
    ctx.stroke();
    if (progress > 0) {
        let len = 2 * Math.PI / 100;
        let angle = len * (progress - 25);
        ctx.beginPath();
        ctx.arc(50, 50, 45, 1.5 * Math.PI, angle, false);
        ctx.lineWidth = 10;
        ctx.strokeStyle = "#2494F2";
        ctx.stroke();
        // if (progress < 100) {
        //     ctx.beginPath();
        //     ctx.arc(50, 50, 45, 1.5 * Math.PI - len / 2, 1.5 * Math.PI, false);
        //     ctx.lineWidth = 10;
        //     ctx.strokeStyle = "#FFFFFF";
        //     ctx.stroke();
        //     ctx.beginPath();
        //     ctx.arc(50, 50, 45, angle, angle + len / 2, false);
        //     ctx.lineWidth = 10;
        //     ctx.strokeStyle = "#FFFFFF";
        //     ctx.stroke();
        // }
    }
    // ctx.beginPath();
    // ctx.arc(50, 50, 40, 0, 2 * Math.PI, false);
    // ctx.fillStyle = "#FFFFFF";
    // ctx.closePath();
    // ctx.fill();
    ctx.fillStyle = "#262A33";
    ctx.textAlign = "center";
    ctx.font = "18px Arial";
    ctx.fillText(periods, 50, 50);
    ctx.fillStyle = "#7E869C";
    ctx.textAlign = "center";
    ctx.font = "14px Arial";
    ctx.fillText(title, 50, 68);
    ctx.restore();
}