/**
 * Created by Sun on 16/10/3.
 */
export default {
    moveOverlay: function (e, overlayState = true, view) {
        e.stopPropagation();
        let top = e.pageY - view.refs['overlay'].offsetTop;
        let left = e.pageX - view.refs['overlay'].offsetLeft - 3;
        if (top < 0) {
            top = 0;
        }
        if (top > 150) {
            top = 150;
        }
        if (left < 0) {
            left = 0;
        }
        if (left > 150) {
            left = 150;
        }
        //console.log("top =", top, "left =", left)
        view.setState({
            overlay: {x: left, y: top},
            overlayState: overlayState,
            value: this.HSBToHex({
                h: 360 - (view.state.slider / 150.0 * 360.0),
                s: left / 150 * 100,
                b: (100 - top / 150 * 100)
            })
        });
    },
    moveSlider: function (e, sliderState = true, view) {
        e.stopPropagation();
        let top = e.pageY - view.refs['slider'].offsetTop - 5;
        if (top < 0) {
            top = 0;
        }
        if (top > 150) {
            top = 150;
        }
        view.setState({
            slider: top,
            sliderState: sliderState,
            overlayColor: this.HSBToHex({h: 360 - (top / 150.0 * 360.0), s: 100, b: 100}),
            value: this.HSBToHex({
                h: 360 - (top / 150.0 * 360.0),
                s: view.state.overlay.x / 150 * 100,
                b: (100 - view.state.overlay.y / 150 * 100)
            })
        });
    },
    getState: function (hex) {
        let color = this.HexToRGB(hex);
        let hsb = this.RGBToHSB(color);
        //console.log("color =", color, "hsb = ", hsb);
        return {
            sliderState: false,
            slider: (360 - hsb.h) / 360 * 150,
            overlayState: false,
            overlay: {x: hsb.s / 100 * 150, y: 150 - hsb.b / 100 * 150},
            overlayColor: this.HSBToHex({h: hsb.h, s: 100, b: 100}),
            value: this.RGBToHex(color)
        };
    },
    fixHSB: function (hsb) {
        return {
            h: Math.min(360, Math.max(0, hsb.h)),
            s: Math.min(100, Math.max(0, hsb.s)),
            b: Math.min(100, Math.max(0, hsb.b))
        };
    },
    fixRGB: function (rgb) {
        return {
            r: Math.min(255, Math.max(0, rgb.r)),
            g: Math.min(255, Math.max(0, rgb.g)),
            b: Math.min(255, Math.max(0, rgb.b))
        };
    },
    fixHex: function (hex) {
        let len = 6 - hex.length;
        if (len > 0) {
            let o = [];
            for (let i = 0; i < len; i++) {
                o.push('0');
            }
            o.push(hex);
            hex = o.join('');
        }
        return hex;
    },
    //Color space convertion
    HexToRGB: function (hex) {
        if (hex[0] === "#") {
            hex = hex.substr(1);
        }
        if (hex.length === 3) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }
        hex = parseInt(hex, 16) || 0xFFFFFF;
        return {r: hex >> 16, g: (hex & 0x00FF00) >> 8, b: (hex & 0x0000FF)};
    },
    HexToHSB: function (hex) {
        return this.RGBToHSB(this.HexToRGB(hex));
    },
    RGBToHSB: function (rgb) {
        let hsb = {
            h: 0,
            s: 0,
            b: 0
        };
        let min = Math.min(rgb.r, rgb.g, rgb.b);
        let max = Math.max(rgb.r, rgb.g, rgb.b);
        let delta = max - min;
        hsb.b = max;
        if (max !== 0) {

        }
        hsb.s = max !== 0 ? 255 * delta / max : 0;
        if (hsb.s !== 0) {
            if (rgb.r === max) {
                hsb.h = (rgb.g - rgb.b) / delta;
            } else if (rgb.g === max) {
                hsb.h = 2 + (rgb.b - rgb.r) / delta;
            } else {
                hsb.h = 4 + (rgb.r - rgb.g) / delta;
            }
        } else {
            hsb.h = -1;
        }
        hsb.h *= 60;
        if (hsb.h < 0) {
            hsb.h += 360;
        }
        hsb.s *= 100 / 255;
        hsb.b *= 100 / 255;
        return hsb;
    },
    HSBToRGB: function (hsb) {
        let rgb = {};
        let h = Math.round(hsb.h);
        let s = Math.round(hsb.s * 255 / 100);
        let v = Math.round(hsb.b * 255 / 100);
        if (s === 0) {
            rgb.r = rgb.g = rgb.b = v;
        } else {
            let t1 = v;
            let t2 = (255 - s) * v / 255;
            let t3 = (t1 - t2) * (h % 60) / 60;
            if (h === 360) h = 0;
            if (h < 60) {
                rgb.r = t1;
                rgb.b = t2;
                rgb.g = t2 + t3
            }
            else if (h < 120) {
                rgb.g = t1;
                rgb.b = t2;
                rgb.r = t1 - t3
            }
            else if (h < 180) {
                rgb.g = t1;
                rgb.r = t2;
                rgb.b = t2 + t3
            }
            else if (h < 240) {
                rgb.b = t1;
                rgb.r = t2;
                rgb.g = t1 - t3
            }
            else if (h < 300) {
                rgb.b = t1;
                rgb.g = t2;
                rgb.r = t2 + t3
            }
            else if (h < 360) {
                rgb.r = t1;
                rgb.g = t2;
                rgb.b = t1 - t3
            }
            else {
                rgb.r = 0;
                rgb.g = 0;
                rgb.b = 0
            }
        }
        return {r: Math.round(rgb.r), g: Math.round(rgb.g), b: Math.round(rgb.b)};
    },
    /**
     * @return {string}
     */
    RGBToHex: function (rgb) {
        let hex = [
            rgb.r.toString(16),
            rgb.g.toString(16),
            rgb.b.toString(16)
        ];
        hex.forEach(function (item, index) {
            if (item.length === 1) {
                hex[index] = '0' + item;
            }
        });
        return hex.join('');
    },
    HSBToHex: function (hsb) {
        //console.log("hsb =", hsb);
        return this.RGBToHex(this.HSBToRGB(hsb));
    }

}