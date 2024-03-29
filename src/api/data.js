import axios from '@/libs/api.request'

export const queryAccountPage = (pageNum, pageSize, searchStr) => {
  console.log('搜索字符串=' + searchStr)
  return axios.request({
    url: '/queryAccountPage?pageNum=' + pageNum + '&pageSize=' + pageSize + '&searchStr=' + searchStr,
    method: 'get'
  })
}

export const queryOrderById = (id) => {
  return axios.request({
    url: '/queryOrderById?id=' + id,
    method: 'get'
  })
}

export const queryOrderExpressById = (id) => {
  return axios.request({
    url: '/queryOrderExpressById?id=' + id,
    method: 'get'
  })
}

export const queryAccountBookSum = (id) => {
  return axios.request({
    url: '/queryAccountBookSum?id=' + id,
    method: 'get'
  })
}

export const finishOrder = (id) => {
  return axios.request({
    url: '/finishOrder?id=' + id,
    method: 'get'
  })
}

export const queryExportAccount = (winningTime) => {
  console.log('预约日期=' + winningTime)
  return axios.request({
    url: '/queryExportAccount?winningTime=' + winningTime,
    method: 'get',
    responseType: 'blob'
  })
}

export const reLogin = (id) => {
  return axios.request({
    url: '/reLogin?id=' + id,
    method: 'get'
  })
}

export const reLoginAll = (id) => {
  return axios.request({
    url: '/reLoginAll',
    method: 'get'
  })
}

export const errorReq = () => {
  return axios.request({
    url: 'error_url',
    method: 'post'
  })
}

export const saveErrorLogger = info => {
  return axios.request({
    url: 'save_error_logger',
    data: info,
    method: 'post'
  })
}

export const uploadImg = formData => {
  return axios.request({
    url: 'image/upload',
    data: formData
  })
}

export const getOrgData = () => {
  return axios.request({
    url: 'get_org_data',
    method: 'get'
  })
}

export const getTreeSelectData = () => {
  return axios.request({
    url: 'get_tree_select_data',
    method: 'get'
  })
}
