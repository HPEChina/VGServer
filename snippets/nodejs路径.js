```javascript
require('path').resolve(process.argv[2]) //基于执行时路径获取绝对路径,一般只适用于解析命令行参数路径
require('path').parse('/test/hello.json') //解析路径,获取路径文件信息
__filename===module.filename //是当前文件名
__dirname //当前文件路径
process.cwd() //只有 require 的路径是相对当前文件即:__dirname，其他大部分函数接收的路径都是相对于程序运行时路径即:process.cwd()
process.chdir('/tmp') //可以修改当前工作空间即:process.cwd()的值
require.main.filename //入口文件名
process.execPath //node可执行文件路径
require('path').parse(require.main.filename).dir //项目根目录
```
