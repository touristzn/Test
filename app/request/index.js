import apiAxios from '../static/util/requestAxios'

const commonParams = {
  g_tk: 1244800424,
  inCharset: 'utf-8',
  outCharset: 'utf-8',
  notice: 0,
  format: 'json'
}

export default function fetch(url, options) {
  const data = Object.assign({}, commonParams, options)
  return apiAxios.get(url, data)
}