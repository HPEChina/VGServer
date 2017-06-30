const OK = 0
const ERROR = 2
const DB404MSG = "Data don't exist!"
const SYS_ERR = 'System Error!'
const MISSING_MODEL_ID = 'Please provide model id!'

const Readable = require('stream').Readable

require('mongodb').MongoClient.connect(process.env.MONGO_DB, function (err, mongo) {
  if (err) return console.error(err)
  const gfs = new (require('mongodb')).GridFSBucket(mongo)
  const collection = mongo.collection('model')
  const imageSize = require('image-size')
  const crypto = require('crypto')
  exports.saveImg = async (ctx, next) => {
    let imgData = decodeURIComponent(ctx.request.body.data)
    imgData = imgData.match(/^data:image\/(\w+);base64,(.+)$/)
    if (!imgData || !imgData[2]) { return ctx.throw(417, 'Submitted data is not image!', { body: { status: 2, data: { msg: 'Submitted data is not image!' } } }) }
    imgData = imgData[2].replace(/\s/g, '+')
    let imgName = imageSize(imgData)
    imgName = crypto.createHash('md5').update(imgData, 'utf8').digest('hex') + '_' + imgName.width + 'x' + imgName.height + '.' + imgName.type
    imgData = Buffer.from(imgData, 'base64')
    var uploadStream = gfs.openUploadStream(imgName)
    const rs = new Readable()
    rs.push(imgData)
    rs.push(null)
    rs.pipe(uploadStream)
    ctx.body = await new Promise((resolve, reject) => {
      uploadStream.once('finish', function (a, b) {
        console.log(a, b)
        resolve({ status: OK, data: { url: imgName } })
      })
    })
  }
  exports.getImg = async (ctx, next) => {
    ctx.body = gfs.openDownloadStreamByName(ctx.params[0])
  }
  exports.getTopo = async (ctx, next) => {
    if (!ctx.request.query.id) {
      ctx.body = { status: ERROR, data: { msg: MISSING_MODEL_ID } }
      return
    }
    try {
      ctx.request.body = await await collection.findOne({ _id: ctx.request.query.id })
      await next()
    } catch (err) {
      return ctx.throw(err, { body: { status: ERROR, data: { msg: SYS_ERR } } })
    }
  }
  exports.postTopo = async (ctx, next, data) => {
    const body = data || ctx.request.body
    body._id = body._key
    try {
      console.time(`mongo save ${body._key}`)
      await collection.insertOne(body)
      console.timeEnd(`mongo save ${body._key}`)
      await next()
    } catch (err) {
      console.error(err.stack)
      ctx.body = { status: ERROR, data: { msg: SYS_ERR } }
    }
  }
  exports.putTopo = async (ctx, next, data) => {
    const body = data || ctx.request.body
    if (!body.id) {
      ctx.body = { status: ERROR, data: { msg: MISSING_MODEL_ID } }
      return
    }
    try {
      await collection.updateOne({ _id: body.id }, body, {upsert: true})
      await next()
    } catch (err) {
      console.error(err.stack)
      ctx.body = { status: ERROR, data: { msg: SYS_ERR } }// 数据更新失败
    }
  }
  exports.deleteTopo = async (ctx, next) => {
    if (!ctx.request.body.id) {
      ctx.body = { status: ERROR, data: { msg: MISSING_MODEL_ID } }
      return
    }
    try {
      await collection.deleteOne({_id: ctx.request.body.id})
      await next()
    } catch (err) {
      console.error(err.stack)
      ctx.body = { status: ERROR, data: { msg: DB404MSG } }
    }
  }
})
