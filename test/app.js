import test from 'ava'
import request from 'supertest'
import app from '../server'

let modelID = ''
let topoID = ''
const data = {
  'filename': 'ava' + new Date().getTime(),
  'class': 'ava' + new Date().getTime(),
  'name': 'ava' + new Date().getTime(),
  'category': 'ava' + new Date().getTime(),
  'type': 'ava' + new Date().getTime(),
  'from': 'lcm',
  designLibraryId: '01f75f78d65d41d19d5d623383ed3657',
  author: 'hwx153096'
}
// process.env.HUAWEI_HOST = 'http://service-sdv.lcm.huawei.com/topology/hutaf-topology/v1/'
// process.env.REDIS = true
// process.env.NODE_LOG = true
// process.env.NODE_ENV = 'development'
test.serial('/model/save', async t => {
  data.codetype = 'xml'
  data.data = require('fs').readFileSync('test/model.xml', 'utf8')
  const res = await request(app.listen()).post('/model/save').send(data)
  modelID = res.body.data.id
  t.is(res.body.status, 0)
  t.truthy(res.body.data.id)
})
test.serial('/viewer/save', async t => {
  data.codetype = 'json'
  data.data = require('fs').readFileSync('test/topo.json', 'utf8')
  const res = await request(app.listen()).post('/viewer/save').send(data)
  topoID = res.body.data.id
  t.is(res.body.status, 0)
  t.truthy(res.body.data.id)
})
test('/model/get', async t => {
  const res = await request(app.listen()).post('/model/get').send({ id: modelID })
  t.is(res.status, 200)
  t.is(res.body.data[0].id, modelID)
})
test('/viewer/get', async t => {
  const res = await request(app.listen()).post('/viewer/get').send({ id: topoID })
  t.is(res.status, 200)
  t.is(res.body.data[0].id, topoID)
})
test('/model/update', async t => {
  data.id = modelID
  data.codetype = 'xml'
  data.data = require('fs').readFileSync('test/model.xml', 'utf8')
  const res = await request(app.listen()).post('/model/update').send(data)
  t.is(res.status, 200)
  t.is(res.body.data.id, modelID)
})
test('/viewer/update', async t => {
  data.id = topoID
  data.codetype = 'json'
  data.data = require('fs').readFileSync('test/topo.json', 'utf8')
  const res = await request(app.listen()).post('/viewer/update').send(data)
  t.is(res.status, 200)
  t.is(res.body.data.id, topoID)
})
test('/models/data/get', async t => {
  const res = await request(app.listen()).post('/models/data/get').send({ id: modelID, from: 'lcm' })
  t.is(res.status, 200)
  t.is(res.body.data[0].id, modelID)
})
test('/topos/data/get', async t => {
  const res = await request(app.listen()).post('/topos/data/get').send({ id: topoID, from: 'lcm' })
  t.is(res.status, 200)
  t.is(res.body.data[0].id, topoID)
})
test('/models/data/update', async t => {
  data.id = modelID
  data.data = JSON.parse(data.data)
  const res = await request(app.listen()).post('/models/data/update').send(data)
  t.is(res.status, 200)
  t.is(res.body.status, 0)
})
test('/topos/data/update', async t => {
  data.id = topoID
  const res = await request(app.listen()).post('/topos/data/update').send(data)
  t.is(res.status, 200)
  t.is(res.body.status, 0)
})
test('/modelClass/get', async t => {
  const res = await request(app.listen()).post('/modelClass/get').send({})
  t.is(res.body.status, 0)
  t.truthy(res.body.data.length)
})
test('/saveFile', async t => {
  const res = await request(app.listen()).post('/saveFile').send({ id: '' + new Date().getTime(), data: require('fs').readFileSync('test/base64.txt', 'utf8') })
  t.is(res.body, 0)
})
test('/saveImg', async t => {
  const res = await request(app.listen()).post('/saveImg').send({ data: require('fs').readFileSync('test/base64.txt', 'utf8') })
  t.is(res.body.status, 0)
  t.truthy(res.body.data.url)
})
test.after('/models/data/del', async t => {
  const res = await request(app.listen()).post('/models/data/del').send({ id: modelID })
  t.is(res.body.status, 0)
})
test.after('/topos/data/del', async t => {
  const res = await request(app.listen()).post('/topos/data/del').send({ id: topoID })
  t.is(res.body.status, 0)
})
