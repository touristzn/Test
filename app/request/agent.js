import agent from '../static/util/requestAgent'

const commonParams = {
  g_tk: 1244800424,
  inCharset: 'utf-8',
  outCharset: 'utf-8',
  notice: 0,
  format: 'json'
}

export async function fetch(options) {
  const url = '/api/musichall/fcgi-bin/fcg_yqqhomepagerecommend.fcg'
  const data = Object.assign({}, commonParams, options)
  const response = await agent.get(url, data);
  return response.body || JSON.parse(response.text);
}

