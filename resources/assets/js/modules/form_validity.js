/**
 * Created by sun_3211 on 2017/3/29.
 */

export function validityTag(validity) {
    if (validity["badInput"]) {
        return "bad";
    } else if (validity["customError"]) {
        return "custom";
    } else if (validity["customError"]) {
        return "custom";
    } else if (validity["patternMismatch"]) {
        return "pattern";
    } else if (validity["rangeOverflow"]) {
        return "over";
    } else if (validity["rangeUnderflow"]) {
        return "under";
    } else if (validity["stepMismatch"]) {
        return "step";
    } else if (validity["tooLong"]) {
        return "long";
    } else if (validity["tooShort"]) {
        return "short";
    } else if (validity["typeMismatch"]) {
        return "type";
    } else if (validity["valid"]) {
        return "";
    } else if (validity["valueMissing"]) {
        return "value";
    } else {
        return "msg";
    }
}
export function setCustomValidity(el, form) {
    el.setCustomValidity("");
    if (!el.validity.valid) {
        let err = validityTag(el.validity);
        el.setCustomValidity(el.dataset[err] || el.dataset["msg"] || "请输入正确的格式");
        return false;
    }
    if (el.dataset.eq && form.elements[el.dataset.eq].value !== el.value) {
        el.focus();
        el.setCustomValidity(el.dataset["eq-msg"] || "");
        return false;
    }
    return true;
}
export function validity(form, field = []) {
    if (!field.length) {
        for (let el of  form.elements) {
            if (el.name) {
                field.push(el.name);
            }
        }
    }
    for (let name of field) {
        let el = form.elements[name];
        if (!setCustomValidity(el, form)) {
            form.reportValidity();
            return false;
        }
    }
    return true;
}