/**
 * localStorage 的封装工具类
 * @param params
 */
import config from '@/config'
const { cookieExpires } = config
// 设置缓存
export const setItem = (name, value) => {
  const obj = {
    name: name,
    value: value,
    expires: cookieExpires || false, // 如果没有设置过期时间，则设置成false
    startTime: new Date().getTime() // 记录何时将值存入缓存，毫秒级
  }
  if (obj.expires) { // 如果设置了过期时间，则以 obj.name 为 key，obj 为值放进去
    localStorage.setItem(obj.name, JSON.stringify(obj))
  } else {
    // 如果 obj.expires 没有设置，就判断一下value的类型
    const type = Object.prototype.toString.call(obj.value)
    // 如果value是对象或者数组对象的类型，就先用JSON.stringify转一下，再存进去
    if (type === '[object Object]') {
      obj.value = JSON.stringify(obj.value)
    }
    if (type === '[object Array]') {
      obj.value = JSON.stringify(obj.value)
    }
    localStorage.setItem(obj.name, obj.value)
  }
}
// 拿到缓存
export const getItem = (name) => {
  let item = localStorage.getItem(name)
  // 先将拿到的试着进行json转为对象的形式
  try {
    item = JSON.parse(item)
  } catch (error) {
    // 如果不行就不是json的字符串，就直接返回
    // item = item
  }
  // 如果有 expires 的值，说明设置了失效时间
  if (item !== null) {
    const currentTime = new Date().getTime()
    // 何时将值取出减去刚存入的时间，与item.expires比较，如果大于就是过期了，如果小于或等于就还没过期
    if (currentTime - item.startTime > item.expires) {
      // 缓存过期，清除缓存，返回false
      localStorage.removeItem(name)
      return false
    } else {
      // 缓存未过期，返回值
      return item.value
    }
  } else {
    // 如果没有设置失效时间，直接返回值
    return item
  }
}
// 移出缓存
export const removeStorageItem = (name) => {
  localStorage.removeItem(name)
}
// 移出全部缓存
export const clear = () => {
  localStorage.clear()
}