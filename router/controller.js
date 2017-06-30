const { req_lcm } = require('../lib')
const graph2data = require('../lib/graph2data')
const config = require('../lib/config')
const uuid = require('uuid/v4')
const fs = require('fs')
const path = require('path')
const imageSize = require('image-size')
const files = require('./collection').db.collection('files')
const crypto = require('crypto')
const OK = 0
const axios = require('axios')
/**
 * 图形数据请求处理控制器
 * @param {Object} route koa-router 实例
 * @param {Object} relateCollection 关联的集合实例
 * @param {Object} collection 集合名称实例
 * @returns
 */
exports.graphController = function (route, relateCollection, collection) {
  route
    .get('/', async (ctx, next) => { // 获取模型或拓扑
      if (!Object.keys(ctx.request.query).length) ctx.request.query = ctx.request.body
      await collection.get(ctx, next)
    }, async (ctx, next) => {
      const docs = await new Promise((resolve, reject) => {
        let loop = 0
        ctx.request.body.forEach((doc, index) => {
          if (doc.class !== 'general') {
            if (collection.collectionName.includes('Data') && !doc.content) {
              ++loop
              fs.readFile(path.join(config.serveDir.serve, 'data', collection.collectionName, doc.path || doc.category || '', doc._key), 'utf8', (e, data) => {
                ctx.request.body[index].content = data
                if (--loop === 0) resolve(ctx.request.body)
              })
            } else if (!collection.collectionName.includes('Data') && !doc.data) {
              ++loop
              fs.readFile(path.join(config.serveDir.serve, 'data', collection.collectionName, doc.path || doc.category || '', doc._key), 'utf8', (e, data) => {
                ctx.request.body[index].data = data
                if (--loop === 0) resolve(ctx.request.body)
              })
            }
          }
        })
        if (loop === 0) resolve(ctx.request.body)
      })
      ctx.body = {
        status: OK,
        data: docs
      }
    })
    .delete('/', async (ctx, next) => { // lcm调用接口，删除数据
      if (!ctx.request.body.id) ctx.request.body = ctx.request.query
      if (!ctx.request.body.id) {
        ctx.body = { status: 2, data: { msg: 'Please provide model id!' } }
        return
      }
      collection.del(ctx.request.body.id)
      relateCollection.del(ctx.request.body.id)
      fs.unlink(path.join(config.serveDir.serve,
        'data',
        collection.collectionName,
        'data' + strMod(hash(ctx.request.body.id)),
        ctx.request.body.id), function () {})
      fs.unlink(path.join(config.serveDir.serve,
        'data',
        relateCollection.collectionName,
        'data' + strMod(hash(ctx.request.body.id)),
        ctx.request.body.id), function () {})
      ctx.body = { status: OK }
    })
    .all('/', async (ctx, next) => { // 所有请求前处理入口
      if (!ctx.request.body.data) ctx.request.body = ctx.request.query
      if (!ctx.request.body.data) { return ctx.throw(417, 'Submitted data is empty!', { body: { status: 2, data: { msg: 'Submitted data is empty!' } } }) }
      await next()
    })
    .post('/', async (ctx, next) => { // editorUI 调用接口，添加图形，post操作忽略参数中的ID
      if (!ctx.request.body.from) {
        ctx.request.body._key = ctx.request.body.id = uuid()
        ctx.request.body.path = 'data' + strMod(hash(ctx.request.body.id))
        await next()
        return
      }
      ctx.request.lcm_data = {}
      ctx.request.lcm_data.name = ctx.request.body.name
      ctx.request.lcm_data.designLibraryId = ctx.request.lcm_data.productLine = ctx.request.body.designLibraryId
      ctx.request.lcm_data.author = ctx.request.body.author
      ctx.request.lcm_data.category = ctx.request.body.category
      ctx.request.lcm_data.content = await new Promise((resolve, reject) => {
        process.nextTick(function () {
          resolve(graph2data(ctx.request.body))
        })
      })
      if (!ctx.request.lcm_data.content) { return ctx.throw(417, 'Submitted data is empty!', { body: { status: 2, data: { msg: 'Submitted data is empty!' } } }) }
      ctx.request.lcm_url = config.huawei[relateCollection.collectionName]
      ctx.request.lcm_method = 'POST'
      if (await req_lcm(ctx) === 'err') return
      if (!ctx.request.body.id) {
        ctx.body = { status: 2, data: { msg: 'LCM does not response id!' } }
        return
      }
      ctx.request.lcm_data.from = ctx.request.body.from
      ctx.request.lcm_data.path = ctx.request.body.path = 'data' + strMod(hash(ctx.request.body.id))
      const data = { data: ctx.request.lcm_data.content, dir: relateCollection.collectionName, category: ctx.request.lcm_data.path, id: ctx.request.body.id }
      if (await syncFile(data) !== OK) ctx.request.lcm_data.unsync = true
      delete ctx.request.lcm_data.content
      if (await relateCollection.save(ctx, ctx.request.lcm_data) !== 'err') await next()
    }, async (ctx, next) => {
      const data = { data: ctx.request.body.data, dir: collection.collectionName, category: ctx.request.body.path, id: ctx.request.body.id }
      if (await syncFile(data) !== OK) ctx.request.body.unsync = true
      delete ctx.request.body.data
      collection.save(ctx)
      ctx.body = { status: OK, data: { id: ctx.request.body._key } }
    })
    .put('/', async (ctx, next) => { // 通用更新图形接口
      if (!ctx.request.body.id) ctx.request.body.id = ctx.request.body.uuid
      if (!ctx.request.body.id) {
        ctx.body = { status: 2, data: { msg: 'Please provide model id!' } }
        return
      }
      if (!ctx.request.body.from || ctx.path.includes('/data')) {
        ctx.request.body.path = 'data' + strMod(hash(ctx.request.body.id))
        await next()
        return
      }
      ctx.request.lcm_data = {}
      ctx.request.lcm_data.name = ctx.request.body.name
      ctx.request.lcm_data.designLibraryId = ctx.request.lcm_data.productLine = ctx.request.body.designLibraryId
      ctx.request.lcm_data.author = ctx.request.body.author
      ctx.request.lcm_data.category = ctx.request.body.category
      ctx.request.lcm_data.id = ctx.request.body.id
      ctx.request.lcm_data.content = await new Promise((resolve, reject) => {
        process.nextTick(function () {
          resolve(graph2data(ctx.request.body))
        })
      })
      if (!ctx.request.lcm_data.content) { return ctx.throw(417, 'Submitted data is empty!', { body: { status: 2, data: { msg: 'Submitted data is empty!' } } }) }
      ctx.request.lcm_url = config.huawei[relateCollection.collectionName] + '/' + ctx.request.body.id
      ctx.request.lcm_method = 'PATCH'
      if (await req_lcm(ctx) === 'err') return
      ctx.request.lcm_data.from = ctx.request.body.from
      ctx.request.lcm_data.path = ctx.request.body.path = 'data' + strMod(hash(ctx.request.body.id))
      const data = { data: ctx.request.lcm_data.content, dir: relateCollection.collectionName, category: ctx.request.lcm_data.path, id: ctx.request.body.id }
      if (await syncFile(data) !== OK) ctx.request.lcm_data.unsync = true
      delete ctx.request.lcm_data.content
      if (await relateCollection.update(ctx, ctx.request.lcm_data) !== 'err') await next()
    }, async (ctx, next) => {
      if (ctx.path.includes('/data')) { // lcm调用,数据结构更新
        if (!ctx.request.body.data.id) ctx.request.body.data.id = ctx.request.body.id
        ctx.request.body = ctx.request.body.data
        delete ctx.request.body.content
        collection.update(ctx)
        ctx.request.body.filename = ctx.request.body.name
        relateCollection.update(ctx)
        ctx.body = { status: 0 }
        return
      }
      // 图形更新
      const data = { data: ctx.request.body.data, dir: collection.collectionName, category: ctx.request.body.path, id: ctx.request.body.id }
      if (await syncFile(data) !== OK) ctx.request.body.unsync = true
      delete ctx.request.body.data
      collection.update(ctx)
      ctx.body = { status: 0, data: { id: ctx.request.body.id } }
    })
}

/**
 * 资源数据请求处理控制器
 * @param {Object} indexRoute koa-router 实例
 * @param {Object} modelClass 集合实例
 * @returns
 */
exports.indexController = function (indexRoute, modelClass) {
  indexRoute
    .all('/modelClass/get', async (ctx, next) => { // 获取模型分类
      if (!Object.keys(ctx.request.query).length) ctx.request.query = ctx.request.body
      await modelClass.get(ctx, next)
    }, function (ctx, next) {
      ctx.body = { status: OK, data: ctx.request.body }
    })
    .all('/saveFile', async (ctx, next) => { // 文件同步接口
      if (ctx.request.body.data.type === 'Buffer') ctx.request.body.data = Buffer.from(ctx.request.body.data.data)
      saveFile(ctx.request.body)
      ctx.body = OK
    })
    .all('/saveImg', async (ctx, next) => { // 图片保存接口
      if (!Object.keys(ctx.request.body).length) ctx.request.body = ctx.request.query
      let imgName = ''
      let imgDir = ''
      let imgData = decodeURIComponent(ctx.request.body.data)
      imgData = imgData.match(/^data:image\/(\w+);base64,(.+)$/)
      if (!imgData || !imgData[2]) { return ctx.throw(417, 'Submitted data is not image!', { body: { status: 2, data: { msg: 'Submitted data is not image!' } } }) }
      imgData = imgData[2].replace(/\s/g, '+')
      const sign = hash(imgData)
      imgData = Buffer.from(imgData, 'base64')
      try {
        const img = await files.document(sign)
        imgDir = img.imgDir || ''
        imgName = img.imgName
      } catch (e) {
        imgDir = 'img' + strMod(sign)
        const imgMeta = imageSize(imgData)
        imgName = sign + '_' + imgMeta.width + 'x' + imgMeta.height + '.' + imgMeta.type
        files.save({ _key: sign, imgDir: imgDir, imgName: imgName })
      }
      try {
        fs.accessSync(path.join(config.serveDir.serve, config.serveDir.uploadImg, imgDir, imgName))
      } catch (e) {
        syncFile({ data: imgData, uploadImg: config.serveDir.uploadImg, dir: imgDir, id: imgName })
      }
      ctx.body = { status: 0, data: { host: process.env.NODE_IP ? 'http://' + process.env.NODE_IP : '', url: imgDir + '/' + imgName } }
    })
}

/**
 * 数据保存为文件
 * @param {Object} data 待保存数据
 * @param {String} dir 存储目录名
 * @param {String} category 数据分类目录
 * @param {String} id 文件名
 * @param {String} uploadImg 图片的存储目录
 * @returns
 */
function saveFile ({ data, dir, category, id, uploadImg }) {
  dir = path.join(config.serveDir.serve, uploadImg || 'data', dir || '', category || '')
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir)
  }
  fs.writeFile(path.join(dir, id), data, function () { })
}
/**
 * 文件保存与同步
 * @param {Object} data 待存储数据
 * @returns
 */
function syncFile (data) {
  return new Promise(async (resolve, reject) => {
    saveFile(data)
    if (process.env.NODE_PARTNER) {
      const request = {
        url: 'http://' + process.env.NODE_PARTNER + ':3000/saveFile',
        method: 'POST',
        data: data
      }
      resolve((await axios(request)).data)
    } else { resolve(OK) }
  })
}
/**
 * 按Key分配槽位
 * @param {String} key 需要分配槽位的Key
 * @param {Number} [radix = 16] 进制
 * @param {Number} [bucket = 30] 插槽数
 * @returns {Number} 槽位号
 */
function strMod (key, radix = 16, bucket = 30) {
  return parseInt(key, radix) % bucket
}

/**
 * Node.JS Hash 算法封装
 * @param {string} str 要进行 hash 运算的字符串
 * @param {string} [algorithm='md5']
 * @param {string} [encoding='hex']
 * @param {string} [inputEncoding='utf8']
 * @returns
 */
function hash (str, algorithm = 'md5', encoding = 'hex', inputEncoding = 'utf8') {
  const md5 = crypto.createHash(algorithm)
  return md5.update(str, inputEncoding).digest(encoding)
}
