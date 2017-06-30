const htmlparser = require('htmlparser2')
const { js2data, getOperand, list2tree } = require('./js2data')

/**
 * 图形转数据
 * @module
 * @param {Object} body 获取的请求数据
 * @return {string} 图形数据结构的JSON字符串
 */
module.exports = function graph2data (body) {
  if (!body) return
  let nodes = null
  if (body.codetype === 'xml') { // model
    try { nodes = JSON.parse(body.data).xml } catch (e) { return }
    nodes = {
      properties: {
        name: body.name,
        type: 'model',
        id: body.id,
        productLine: body.designLibraryId,
        author: body.user || body.author,
        from: body.from
      },
      resources: xml2data(nodes)
    }
    return JSON.stringify(nodes)
  }
  if (body.codetype === 'json') { // topo
    try {
      nodes = JSON.parse(
        body.data.replace(/\\&quot;/g, '\\\\\\"')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&#39;/g, "'")
          .replace(/&quot;/g, '\\"')).mxGraphModel.root
    } catch (e) { return }
    // if (!nodes || !nodes.shift) return
    nodes = js2data(nodes)
    nodes.properties.name = body.filename
    nodes.properties.type = 'topology'
    nodes.properties.id = body.id
    nodes.properties.designLibraryId = body.designLibraryId
    nodes.properties.author = body.user || body.author
    nodes.properties.from = body.from
    return JSON.stringify(nodes)
  }
}

/**
 * nodejs xml模型转数据
 * @param {string} xml 模型XML字符串
 * @return {object[]} 模型数据结构的resources对象
 * @version 3.0.0
 */
function xml2data (xml) {
  if (!xml) return
  let modelID = ''
  let resources = {}
  const resourcesID = []
  const parser = new htmlparser.Parser({
    onopentag: function (_key, model) {
      if (_key !== 'object' && _key !== 'mxCell') return
      if (model.id) {
        modelID = model.id // 记录当前nodeID //object 包含 mxCell 时,mxCell无id,复用上级object的id
        if (modelID === '1') return// 忽略id=1
        resourcesID.push(modelID)
        resources[modelID] = {// 初次获得id,初始化resources
          properties: { id: modelID }
        }
      }
      if (model.parent) { // object无parent,复用下级mxCell的parent
        if (model.parent === '1') { // 忽略保存模型时强制加组
          delete resources[modelID]
          resourcesID.pop()
          return
        }
        resources[modelID].parent = model.parent
        if (resources[model.parent]) {
          resources[model.parent].active = true // 有后代
        }
      }
      if (_key === 'object') { // 获取模型属性
        let property = ''
        if (model['intrinsic']) {
          try { property = JSON.parse(model['intrinsic']) } catch (e) { }
          if (property.length) {
            property.forEach(function (prop) {
              resources[modelID].properties[prop.name] = prop.value[0]
            })
            resources[modelID].active = true // 有属性
          }
        }
        if (model['extended']) {
          try { property = JSON.parse(model['extended']) } catch (e) { }
          if (property.length) {
            property = property.map(function (prop) {
              return getOperand(prop)
            })
            resources[modelID].operand = { operands: property }
            resources[modelID].active = true // 有属性
          }
        }
      }
    }
  }, { decodeEntities: true, xmlMode: true })
  parser.write(xml)
  parser.end()
  return list2tree(resources, resourcesID)
}
