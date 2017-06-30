const test = exports.test = new (require('koa-router'))({ prefix: '/test' })

// const md5 = require('crypto').createHash('md5')
const Readable = require('stream').Readable
// const imageSize = require('image-size')
require('mongodb').MongoClient.connect('mongodb://122.115.49.92:27017,122.115.49.90:27017,122.115.49.75:27017/designer?replicaSet=designer', function (err, mongo) {
  if (err) return console.error(err)
  const gfs = new (require('mongodb')).GridFSBucket(mongo)

  // const mongo = require('mongodb').MongoClient.connect('mongodb://user:password@122.115.49.70:27017/designer?authMechanism=DEFAULT')
  const collection = mongo.collection('model')
  // const fschunks = mongo.collection('fs.chunks')
  // const fsfiles = mongo.collection('fs.files')

  test.all('/gfs.png', async (ctx, next) => {
    const key = require('uuid/v4')() + '_test'
    let imgData = decodeURIComponent('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGYAAAAqCAYAAABBRS51AAACkUlEQVR4nO2Yv0tbURTHv7aBKoixLcVSQotIMwQCXTKWTtncHMU9yeLaPyFrFs3URTp2q1On4lJ4ixBwiEgphFIVtYIQAy3tu+9H8/JyX/pyo71f6/lASLjJe+9yPjnn3HunfrnAJdtoQeDhju0JCHpEDCkihhQRQ4qIIUXEkCJiSBExpIgYUkQMKSKGlFsoJgdnvQinbHseo+EQ82IRXyqLqKb53aRBLc8g777ll1I8zyJTDKfL1ZUC6rm77qdLvG3so+b9q+97ARyH752vePbuJOXzgJ2Pe1jeNZrytUMhxieUEcrRoDLm1SyO9loofUi6z0O8rzzBy3sTTqd3gdfNz9ic8DamZCw9V0MHpQbgVObw1CtVz3FemNb+cr5QdL+LDcYDeXqG7FbHYB6BWIMrrxIiMQpXTjP8vI9sPCtSZUwSKiNn4AxkoxqbwyFhSbNfyrxgZ7AdCVi/54xJUvkp97OvHZUaGbdduuJYFxOV0DbKhFFE+s2I0na9czDDuhifyCrMuDcMMn6wI3MgyB4SMQr1714APgX1Pugn8ymv/hP8CcvTxloRqw9i97QAUfM/wXJzeA/y1+AEAkOqx13s9KaxcGAW1NpWCzUld+kH3lgsaURirobN3Y73guEm1c8yzYrwH0Mkxg8kYhmS1+1ZNBwNjah9ka5XhfsU+31kFDxigjOsdmx43FL2v8BxiOmy8Vg17Es4BEtVBkgyJoeSWgmddofOyMxL2c2GQ0xYxr4N94TbWsooxPhl7CcOjw0ufpTx9jr9jEm7GptFfb2IetLXcroclLFeF9tpDhJ1G083iP09R9Jq7GZBtPMXotCsyoRBRAwpIoYUEUOKiCFFxJAiYkgRMaSIGFJEDCm/AZJEGT/YqQg3AAAAAElFTkSuQmCC')
    imgData = imgData.match(/^data:image\/(\w+);base64,(.+)$/)
    if (!imgData || !imgData[2]) { return ctx.throw(417, 'Submitted data is not image!', { body: { status: 2, data: { msg: 'Submitted data is not image!' } } }) }
    imgData = imgData[2].replace(/\s/g, '+')
    // const sign = md5.update(imgData, 'utf8').digest('hex')
    imgData = Buffer.from(imgData, 'base64')
    // let imgMeta = imageSize(imgData)
    // imgMeta = sign + '_' + imgMeta.width + 'x' + imgMeta.height + '.' + imgMeta.type
    const rs = new Readable()
    rs.push(imgData)
    rs.push(null)
    rs.pipe(gfs.openUploadStream(key))
    // let img = await fsfiles.findOne({ filename: imgMeta })
    // img = await fschunks.findOne({ files_id: img._id })
    // ctx.type = imgMeta.type
    // ctx.body = img.data.buffer
    // ctx.body = gfs.openDownloadStreamByName(key)
    ctx.body = imgData
  })

  test.all('/mongo', async function (ctx) {
    try {
      ctx.request.body._id = (await collection.insertOne(ctx.request.body)).ops[0]._id
      ctx.body = await collection.findOne({ '_id': ctx.request.body._id })
    } catch (err) {
      ctx.throw(err)
    }
  })
})

const riak = new (require('basho-riak-client')).Client(['122.115.49.92:8087', '122.115.49.90:8087', '122.115.49.75:8087'])
test.all('/riak.png', async function (ctx) {
  const key = require('uuid/v4')() + '_test'
  let imgData = decodeURIComponent('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGYAAAAqCAYAAABBRS51AAACkUlEQVR4nO2Yv0tbURTHv7aBKoixLcVSQotIMwQCXTKWTtncHMU9yeLaPyFrFs3URTp2q1On4lJ4ixBwiEgphFIVtYIQAy3tu+9H8/JyX/pyo71f6/lASLjJe+9yPjnn3HunfrnAJdtoQeDhju0JCHpEDCkihhQRQ4qIIUXEkCJiSBExpIgYUkQMKSKGlFsoJgdnvQinbHseo+EQ82IRXyqLqKb53aRBLc8g777ll1I8zyJTDKfL1ZUC6rm77qdLvG3so+b9q+97ARyH752vePbuJOXzgJ2Pe1jeNZrytUMhxieUEcrRoDLm1SyO9loofUi6z0O8rzzBy3sTTqd3gdfNz9ic8DamZCw9V0MHpQbgVObw1CtVz3FemNb+cr5QdL+LDcYDeXqG7FbHYB6BWIMrrxIiMQpXTjP8vI9sPCtSZUwSKiNn4AxkoxqbwyFhSbNfyrxgZ7AdCVi/54xJUvkp97OvHZUaGbdduuJYFxOV0DbKhFFE+s2I0na9czDDuhifyCrMuDcMMn6wI3MgyB4SMQr1714APgX1Pugn8ymv/hP8CcvTxloRqw9i97QAUfM/wXJzeA/y1+AEAkOqx13s9KaxcGAW1NpWCzUld+kH3lgsaURirobN3Y73guEm1c8yzYrwH0Mkxg8kYhmS1+1ZNBwNjah9ka5XhfsU+31kFDxigjOsdmx43FL2v8BxiOmy8Vg17Es4BEtVBkgyJoeSWgmddofOyMxL2c2GQ0xYxr4N94TbWsooxPhl7CcOjw0ufpTx9jr9jEm7GptFfb2IetLXcroclLFeF9tpDhJ1G083iP09R9Jq7GZBtPMXotCsyoRBRAwpIoYUEUOKiCFFxJAiYkgRMaSIGFJEDCm/AZJEGT/YqQg3AAAAAElFTkSuQmCC')
  imgData = imgData.match(/^data:image\/(\w+);base64,(.+)$/)
  if (!imgData || !imgData[2]) { return ctx.throw(417, 'Submitted data is not image!', { body: { status: 2, data: { msg: 'Submitted data is not image!' } } }) }
  imgData = imgData[2].replace(/\s/g, '+')
  // const sign = md5.update(imgData, 'utf8').digest('hex')
  imgData = Buffer.from(imgData, 'base64')
  try {
    riak.storeValue({ bucket: 'img', key: key, value: imgData }, function (err, rslt) {
      return err || rslt
    })
    // ctx.body = await new Promise((resolve, reject) => {
    // riak.storeValue({ bucket: 'img', key: key, value: imgData, w: 0 }, function () {
    //   riak.fetchValue({ bucket: 'img', key: key, r: 1, timeout: 300000 }, function (err, rslt) {
    //     err ? reject(err) : resolve(rslt.values[0].value)
    //   })
    // })
    // })
    ctx.body = imgData
  } catch (err) {
    ctx.throw(err)
  }
})
test.all('/riak', async function (ctx) {
  try {
    ctx.request.body = await new Promise((resolve, reject) => {
      riak.fetchValue({ bucket: 'model', key: '6766fcd6-4b29-4298-9513-2895d093b150_test', convertToJs: true, r: 1, timeout: 300000 }, function (err, rslt) {
        err ? reject(err) : resolve(rslt.values[0].value)
      })
    })
    await new Promise((resolve, reject) => {
      riak.storeValue({ bucket: 'model', value: ctx.request.body, w: 0, timeout: 300000 }, function (err, rslt) {
        err ? reject(err) : resolve(rslt)
      })
    })
    ctx.body = ''
  } catch (err) {
    ctx.throw(err)
  }
})

// const redis = require('redis').createClient(6379, '122.115.49.70')
// const arango = require('arangojs')(`http://122.115.49.70:8529`)
// arango.useBasicAuth('test', 'test')
// arango.useDatabase('designer')
// const collection = arango.collection('model')
// var couchbase = require('couchbase')
// var cluster = new couchbase.Cluster('couchbase://122.115.49.70/')
// var bucket = cluster.openBucket('default')

// bucket.manager().createPrimaryIndex(function () {
//   test.all('/couchbase', async function (ctx) {
//     const key = require('uuid/v4')() + '_test'
//     try {
//       await new Promise((resolve, reject) => {
//         bucket.insert(key, ctx.request.body, function (err, rslt) {
//           err ? reject(err) : resolve(rslt)
//         })
//       })
//       ctx.body = await new Promise((resolve, reject) => {
//         bucket.get(key, function (err, rslt) {
//           err ? reject(err) : resolve(rslt)
//         })
//       })
//     } catch (err) {
//       ctx.throw(err)
//     }
//   })
// })

// test.all('/redis', async function (ctx) {
//   const key = require('uuid/v4')() + '_test'
//   try {
//     redis.set(key, JSON.stringify(ctx.request.body))
//     ctx.body = await new Promise((resolve, reject) => {
//       redis.get(key, function (err, rslt) {
//         err ? reject(err) : resolve(rslt)
//       })
//     })
//   } catch (err) {
//     ctx.throw(err)
//   }
// })

// test.all('/arango', async function (ctx) {
//   ctx.request.body._key = require('uuid/v4')() + '_test'
//   try {
//     await collection.save(ctx.request.body)
//     ctx.body = await collection.document(ctx.request.body._key)
//   } catch (err) {
//     ctx.throw(err)
//   }
// })
