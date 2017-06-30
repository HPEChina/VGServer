const {
  ERROR,
  DATA404,
  ARANGO_HOST: host,
  ARANGO_PORT: port,
  ARANGO_USERNAME: username,
  ARANGO_PASSWORD: password,
  ARANGO_DB: database
} = require('../lib/config')
const db = exports.db = require('arangojs')(`http://${host}:${port}`)
console.time(`initdb http://${host}:${port}`)
db.useBasicAuth(username, password)
db.useDatabase(database)
console.timeEnd(`initdb http://${host}:${port}`)

/**
 * 添加模型分类
 * @name addClass
 * @param {string} className 分类名称
 * @param {string} description 描述信息
 */
async function addClass ({
  class: className,
  description
}) {
  if (!className) return
  // 检查模型分类是否存在
  let aql = `FOR d IN modelClass
            FILTER d.name=='${className}'
            RETURN d`
  const cursor = await db.query(aql)
  // 若不存在添加分类
  if (!cursor._result.length) {
    aql = `INSERT {
                name: '${className}',
                description: '${description || className}',
                deleted:'no'
            } IN modelClass`
    db.query(aql)
  }
}

/**
 * @class 数据库集合
 */
exports.Collection = class Collection {
  /**
   * Creates an instance of Collection.
   * @param {string} collectionName 数据库集合名称
   */
  constructor (collectionName) {
    this.collectionName = collectionName
    this.collection = db.collection(collectionName)
  }
  /**
   * 数据库查询
   * @param {Object} ctx koa 上下文
   * @param {function} next koa 中间件级联
   */
  async get (ctx, next) {
    let query = ctx.request.query
    let _orderby = query._orderby || 'createdAt'
    let _sort = query._sort || 'asc'
    delete query._orderby
    delete query._sort
    let docs = {}
    if (typeof query.query === 'string') { // aql查询
      query = `FOR d IN ${this.collectionName}
                    FILTER ${query.query}
                    SORT d.${_orderby} ${_sort.toUpperCase()}
                    RETURN d`
      docs = await db.query(query)
    } else {
      docs = await this.collection.byExample(query)
    }
    docs = await docs.all()
    if (!docs.length) {
      ctx.body = {
        status: ERROR,
        data: {
          msg: DATA404
        }
      }
      return
    }
    // objectArraySort(docs, _orderby, _sort)
    ctx.request.body = docs
    await next()
  }

  /**
   * 添加数据库记录
   * @param  {Object}  ctx  koa 上下文
   * @param  {Object}  data 要保存到数据库中的数据
   */
  async save (ctx, data) {
    const body = data || ctx.request.body
    addClass(body)
    // 保存数据
    body.createdAt = new Date().getTime()
    // 不能使用request传过来的id
    await this.collection.save(body)
  }
  /**
   * 数据库记录更新
   * @param  {Object}  ctx  koa 上下文
   * @param  {Object}  data 要更新到数据库中的数据
   */
  async update (ctx, data) {
    const body = data || ctx.request.body
    addClass(body)
    body.updatedAt = new Date().getTime()
    let meta = await this.collection.updateByExample({
      _key: body.id
    }, body)
    if (!meta.updated) {
      body._key = body.id
      await this.collection.save(body)
    }
  }

  /**
   * 删除数据库记录
   * @param  {String} id 待删除记录的ID
   */
  del (id) {
    this.collection.remove(id)
  }
}
