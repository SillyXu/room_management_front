import { setItem, getItem, removeStorageItem } from '@/utils/localStorage'

export const TOKEN_KEY = 'token'
export const USER_INFO = 'userInfo' // 登录成功后获取到的用户信息【包括用户Id，角色，权限，头像】

// 存入token
export const setToken = (token) => {
  setItem(TOKEN_KEY, token)
}

// 取出token
export const getToken = () => {
  return getItem(TOKEN_KEY)
}

// 清空token
export const removeToken = () => {
  removeStorageItem(TOKEN_KEY)
}

// 存入用户信息
export const setUserInfo = (userInfo) => {
  setItem(USER_INFO, userInfo)
}

// 取出用户信息
export const getUserInfo = () => {
  return getItem(USER_INFO)
}

// 清空用户信息
export const removeUserInfo = () => {
  removeStorageItem(USER_INFO)
}

// 根据 key 清除localStorage数据
export const clearStorageItem = (name) => {
  removeStorageItem(name)
}