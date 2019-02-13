const commonParams = {
  g_tk: 1244800424,
  inCharset: 'utf-8',
  outCharset: 'utf-8',
  notice: 0,
  format: 'json'
}

export default function fetch(url, options) {
  const data = Object.assign({}, commonParams, options)

  return axios.get(url, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    params: data
  }).then((res) => {
    return Promise.resolve(res.data)
  }).catch((e) => {
    console.log(e)
  })
}