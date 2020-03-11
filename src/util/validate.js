// 英文、数字、下划线
export const validateFieldInput = (rule, value, callback) => {
  if (!/^[0-9a-zA-Z_]{1,}$/.test(value)) {
    callback(new Error('请输入英文、数字、下划线'))
  } else {
    callback()
  }
}
