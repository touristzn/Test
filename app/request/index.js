import apiAxios from '../static/util/requestAxios'

const commonParams = {
  g_tk: 1244800424,
  inCharset: 'utf-8',
  outCharset: 'utf-8',
  notice: 0,
  format: 'json'
}

export function fetch(options) {
  const url = '/api/musichall/fcgi-bin/fcg_yqqhomepagerecommend.fcg'
  const data = Object.assign({}, commonParams, options)
  return apiAxios.get(url, data);
}