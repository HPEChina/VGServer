const modelCollection = new (require('./collection')).Collection('model')
const viewerCollection = new (require('./collection')).Collection('viewer')
const modelsDataCollection = new (require('./collection')).Collection('modelsData')
const toposDataCollection = new (require('./collection')).Collection('toposData')
const modelClass = new (require('./collection')).Collection('modelClass')
const index = exports.index = new (require('koa-router'))()
const model = exports.model = new (require('koa-router'))({ prefix: '/model' })
const viewer = exports.viewer = new (require('koa-router'))({ prefix: '/viewer' })
const modelsData = exports.modelsData = new (require('koa-router'))({ prefix: '/models/data' })
const toposData = exports.toposData = new (require('koa-router'))({ prefix: '/topos/data' })

/**
 * 请求处理入口
 * @name router
 */
require('./controller').indexController(index, modelClass)
require('./controller').graphController(model, modelsDataCollection, modelCollection)
require('./controller').graphController(viewer, toposDataCollection, viewerCollection)
require('./controller').graphController(modelsData, modelCollection, modelsDataCollection)
require('./controller').graphController(toposData, viewerCollection, toposDataCollection)
