/*
模型节点排序,v4.0
*/
function graphNodeSort (nodes) {
  var keys = Object.keys(nodes)
  for (var index = 0; index < keys.length; index++) {
    var parentKey = nodes[keys[index]].parent
    if (parentKey) {
      var parentIndex = keys.indexOf(parentKey)
      if (index > parentIndex) {
        keys.push(keys.splice(parentIndex, 1)[0])
                // keys.splice(index+1, 0, keys.splice(parentIndex, 1)[0]);
        index--
      }
    }
  }
  return keys
}
