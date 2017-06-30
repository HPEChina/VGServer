var parser = require('xml2json')

var xml = '<foo attr="value">bar</foo>'
console.log('input -> %s', xml)

// xml to json
var json = parser.toJson(xml)
console.log('to json -> %s', json)

// json to xml
var xml = parser.toXml(json)
console.log('back to xml -> %s', xml)
