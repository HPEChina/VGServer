const axios = require('axios')
const {ERROR, EXISTS} = require('./config')

/**
 * 发送lcm请求
 * @module
 * @param {object} ctx koa 上下文
 * @return
 */
exports.req_lcm = async function (ctx) {
  if (!process.env.HUAWEI_HOST) { // 开发环境直接返回
    ctx.request.lcm_data.id =
      ctx.request.lcm_data._key =
      ctx.request.body.id =
      ctx.request.body._key =
      ctx.request.lcm_data.id || (require('uuid/v4')() + '_test')
    return
  }
  console.time('req lcm')
  if (!ctx.request.lcm_data.name) ctx.request.lcm_data.name = ctx.request.body.filename
  const request = {
    timeout: 3000, // 请求超时时间 ms
    headers: {
      'request_id': '3748f8af-80b9-4c77-9f8b-cb99770b9d1a',
      'request_user': 'gwx117385',
      'request_token': '3748f8af-80cb99770b9d1a'
    }
  }
  let data = null
  if (ctx.request.lcm_method !== 'POST') { // 模型或topo更新前检查数据是否存在
    request.method = 'GET'
    if (ctx.request.lcm_url.includes('topos')) { // topo
      request.url = process.env.HUAWEI_HOST + `topos/${ctx.request.lcm_data.id}/basic-attr`
    } else { // model
      request.url = process.env.HUAWEI_HOST + `models/${ctx.request.lcm_data.id}`
    }
    // console.log('lcm query', request)
    try { data = (await axios(request)).data } catch (e) {
      ctx.body = { status: ERROR, data: { msg: `${request.url} Unavailable` } }
      return 'err'
    }
    // console.log('lcm query res ' + new Date(), data)
    if (
      Object.prototype.toString.call(data) !== '[object Object]' ||
      Object.prototype.toString.call(data.result) !== '[object Object]'
    ) { // 更新的id数据不存在
      ctx.body = { status: ERROR, data: { msg: "Data don't exist!" } }
      return 'err'
    } else if (data.result.reason) {
      ctx.body = { status: ERROR, data: { msg: data.result.reason } }
      return 'err'
    } else if (data.result.id !== ctx.request.lcm_data.id) { // 更新的id数据不存在
      ctx.body = { status: ERROR, data: { msg: "Data don't exist!" } }
      return 'err'
    }
  }
  // 查询名称是否存在
  request.method = 'POST'
  request.data = {
    'filter': {
      'name': ctx.request.lcm_data.name
    },
    'page_size': 1,
    'page_number': 1,
    'user': ctx.request.body.author
  }
  if (ctx.request.lcm_url.includes('topos')) { // topo
    request.url = process.env.HUAWEI_HOST + 'topos/actions/query'
    request.data.filter.designLibraryId = ctx.request.body.designLibraryId
  } else { // model
    request.url = process.env.HUAWEI_HOST + 'models/actions/query'
    request.data.filter.productLine = ctx.request.body.designLibraryId
    request.data.filter.category = ctx.request.body.category
  }
  // console.log('lcm query', request)
  try { data = (await axios(request)).data } catch (e) {
    ctx.body = { status: ERROR, data: { msg: `${request.url} Unavailable` } }
    return 'err'
  }
  // console.log('lcm query res ' + new Date(), data)
  if (Object.prototype.toString.call(data) === '[object Object]') {
    if (
      Array.isArray(data.result) &&
      Object.prototype.toString.call(data.result[0]) === '[object Object]' &&
      data.result[0].name === ctx.request.lcm_data.name && // name存在
      data.result[0].id !== ctx.request.lcm_data.id // name冲突
    ) {
      ctx.body = { status: EXISTS, data: { msg: 'name already exists!' } }
      return 'err'
    }
    if (Object.prototype.toString.call(data.result) === '[object Object]' && data.result.reason) {
      ctx.body = { status: ERROR, data: { msg: data.result.reason } }
      return 'err'
    }
  }
  // 向lcm发送数据
  request.url = process.env.HUAWEI_HOST + ctx.request.lcm_url
  request.method = ctx.request.lcm_method
  request.data = ctx.request.lcm_data
  try { data = (await axios(request)).data } catch (e) {
    ctx.body = { status: ERROR, data: { msg: `${request.url} Unavailable` } }
    return 'err'
  }
  console.timeEnd('req lcm')
  // console.log('lcm  res  ' + new Date(), data)
  if (
    Object.prototype.toString.call(data) === '[object Object]' &&
    Object.prototype.toString.call(data.result) === '[object Object]'
  ) {
    if (data.result.reason) {
      ctx.body = { status: ERROR, data: { msg: data.result.reason } }
      return 'err'
    } else if (data.result.id) {
      ctx.request.lcm_data.id =
        ctx.request.lcm_data._key =
        ctx.request.body.id =
        ctx.request.body._key =
        data.result.id + ''
    }
  }
}
const ComplexType = /**
 *  数据类型判断
 * @param {any} o
 * @return {string}
 * @example
 * // returns 'Undefined'
 * ComplexType(undefined)
 * typeof o === 'undefined'
 * isNaN(o)
 * @example
 * // returns 'Null'
 * ComplexType(null)
 * o === null
 * @example
 * // returns 'Array'
 * ComplexType([])
 * Array.isArray([])
 * @example
 * // returns 'String'
 * ComplexType('')
 * typeof '' === 'string'
 * @example
 * // returns 'Number'
 * ComplexType(1)
 * typeof 1 === 'number'
 * @example
 * // returns 'Boolean'
 * ComplexType(true)
 * typeof true === 'boolean'
 * @example
 * // returns 'Function'
 * ComplexType(function(){})
 * typeof function(){} === 'function'
 * @example
 * // returns 'Object'
 * ComplexType({})
 * @example
 * // returns 'Date'
 * ComplexType(new Date())
 * @example
 * // returns 'RegExp'
 * ComplexType(/./)
 */
  exports.ComplexType = function (o) {
    return Object.prototype.toString.call(o).slice(8, -1)
  }
const isObjects = /**
   * 判断非空对象
   * @param {any} o
   * @returns
   */
  exports.isObjects = function (o) { // 非空对象(或数组)
    for (let k in o) { return true }
    return false
  }
/**
 * 判断非空数组
 * @param {any} o
 * @returns
 */
exports.isArrays = function (o) { // 非空数组
  return Array.isArray(o) && o.length
}
/**
 * 判断无效数据
 * 假值:undefined,null,0,+0,-0,NaN,'',"",false
 * 空对象:{}
 * 空数组:[]
 * @param {any} o
 * @returns
 */
exports.isFalse = function (o) {
  return !o ||// 假值
    (typeof o === 'object' && (
      (ComplexType(o) === 'String' && o.toString() === '') ||
      (ComplexType(o) === 'Number' && o.toString() === '0') ||
      (ComplexType(o) === 'Boolean' && o.toString() === 'false') ||
      ((ComplexType(o) === 'Array' || ComplexType(o) === 'Object') && !isObjects(o))// 空对象(或数组)
    )
    )
}
