import agent from '../static/util/requestAgent'

const commonParams = {
  g_tk: 1244800424,
  inCharset: 'utf-8',
  outCharset: 'utf-8',
  notice: 0,
  format: 'json'
}

export default async function fetch(url, options) {
  const data = Object.assign({}, commonParams, options)
  const response = await agent.get(url, data);
  return response.body || JSON.parse(response.text);
}
