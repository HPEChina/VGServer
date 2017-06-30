// rs.pipe(res);pipe方法接收一个可读流 rs,监听 rs 的'data' 和'end'事件,并将其数据输出到可写流 res,然后返回res流,这样就可以接连使用多个.pipe()，如下：
// a.pipe(b).pipe(c).pipe(d)
// 功能与下面的代码相同：
// a.pipe(b);
// b.pipe(c);
// c.pipe(d);
const server = require('http').createServer(function (req, res) {
  const Readable = require('stream').Readable
  const rs = new Readable()
  rs.push('Hi!')
  rs.push(null)
  rs.pipe(res)
})
server.listen(8000)
