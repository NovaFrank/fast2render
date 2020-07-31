function isEmptyString(rule, value, callback) {
  const isVerified = !!(value && typeof value === 'string' && value.trim());

  if (typeof callback === 'function') {
    isVerified ? callback() : callback(new Error('请输入 非空字符串'));
  } else {
    return {
      isVerified,
      message: '请输入 非空字符串'
    };
  }
}

function isPositiveNumber(rule, value, callback) {
  const isVerified = value && Number(value) > 0;

  if (typeof callback === 'function') {
    isVerified ? callback() : callback(new Error('请输入 大于零的整数或小数'));
  } else {
    return {
      isVerified,
      message: '请输入 大于零的整数或小数'
    };
  }
}

export const Validator = {
  isEmptyString,
  isPositiveNumber
};
