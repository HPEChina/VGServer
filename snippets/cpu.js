var child = require('child_process').fork(__dirname + '/child.js')

child.on('message', function (m) {
  process.stdout.write(m.result.toString())
})

function fiboLoop () {
  child.send({v: 30})
}

function spinForever () {
  process.stdout.write('.')
}

process.nextTick(fiboLoop)
process.nextTick(spinForever)
console.log(123)
