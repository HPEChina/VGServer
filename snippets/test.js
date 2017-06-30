const test = exports.test = new (require('koa-router'))({ prefix: '/test' })
const Readable = require('stream').Readable
imgData = imgData.match(/^data:image\/(\w+);base64,(.+)$/)
imgData = imgData[2].replace(/\s/g, '+')
const fs = require('fs')
require('mongodb').MongoClient.connect('mongodb://122.115.49.92:27017,122.115.49.90:27017,122.115.49.75:27017/designer?replicaSet=designer', function (err, mongo) {
  if (err) return console.error(err)
  const gfs = new (require('mongodb')).GridFSBucket(mongo)
  const collection = mongo.collection('model')
  test.all('/gfs.png', async (ctx) => {
    const imgDataBUF = Buffer.from(imgData, 'base64')
    const key = require('uuid/v4')() + '_test'
    var uploadStream = gfs.openUploadStream(key)
    const rs = new Readable()
    rs.push(imgDataBUF)
    rs.push(null)
    rs.pipe(uploadStream)

    ctx.body = await new Promise((resolve) => {
      uploadStream.once('finish', function () {
        resolve(gfs.openDownloadStreamByName(key))
      })
    })
  })
  test.all('/mongo.png', async (ctx) => {
    const key = require('uuid/v4')() + '_test'
    await collection.insertOne({_id: key, data: imgData})
    ctx.body = Buffer.from((await collection.findOne({ _id: key })).data, 'base64')
  })
})
test.all('/buf.png', async (ctx) => {
  const imgDataBUF = Buffer.from(imgData, 'base64')
  const key = require('uuid/v4')() + '_test'
  ctx.body = await new Promise((resolve) => fs.writeFile('tmp/' + key, imgDataBUF, 'base64', () => {
    resolve(fs.createReadStream('tmp/' + key))
  }))
})
test.all('/fs.png', async (ctx) => {
  const key = require('uuid/v4')() + '_test'
  ctx.body = await new Promise((resolve) => fs.writeFile('tmp/' + key, imgData, 'base64', () => {
    fs.readFile('tmp/' + key, 'base64', (e, data) => {
      resolve(Buffer.from(data, 'base64'))
    })
  }))
})