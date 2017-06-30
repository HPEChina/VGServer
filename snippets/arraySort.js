/*
对象数组排序：按指定key值排序
*/
exports.objectArraySort = function (data, _orderby, _sort) {
  if (!data[0][_orderby]) _orderby = '_key'
  const local = typeof data[0][_orderby] !== 'number' && isNaN(Number(data[0][_orderby]))
  _sort = _sort || 'asc'
  console.time(`数字:${!local}, orderby:${_orderby}, 排序方式:${_sort}`)
  data.sort(function (d1, d2) {
    let cmp = 0
    if (local) {
      cmp = d1[_orderby].localeCompare(d2[_orderby])
            // const strLength = d1[_orderby].length < d2[_orderby].length ? d1[_orderby].length : d2[_orderby].length;
            // for (let j = 0; j < strLength; j++) {
            //   cmp = d1[_orderby].charCodeAt(j) - d2[_orderby].charCodeAt(j)
            //   if (cmp !== 0) break;
            // }
            // if (cmp === 0) cmp = d1[_orderby].length - d2[_orderby].length
    } else cmp = d1[_orderby] - d2[_orderby]
    return _sort === 'asc' ? cmp : -1 * cmp
  })
  console.timeEnd(`数字:${!local}, orderby:${_orderby}, 排序方式:${_sort}`)
}
