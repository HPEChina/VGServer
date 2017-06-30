const axios = require('axios').create({
  baseURL: 'http://google.com/api',
  timeout: 3000,
  headers: {'X-Custom-Header': 'foobar'}
})

function getUserAccount () {
  return axios.get('/user/12345', {
    params: {
      ID: 12345
    }
  })
}

function getUserPermissions () {
  return axios.get('/user/12345/permissions')
}

require('axios')
  .all([getUserAccount(), getUserPermissions()])// 并发请求
  .then(require('axios').spread(function (acct, perms) {
    console.log(acct, perms)// 所有请求完成
  })).catch(function (error) { // 捕获错误
    if (error.response) {
      console.log(error.response.statusText)
    } else {
      console.log(error.message)
    }
  })
