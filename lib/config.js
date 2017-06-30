/**
 * 配置文件
 * @readonly
 * @const {object}
 */
module.exports = Object.freeze({
  port: 3000, // Nodejs server 端口
  huawei: Object.freeze({
    host: process.env.HUAWEI_HOST, // LCM URL
    toposData: 'topos', // topo URL 路径
    modelsData: 'models'// model URL 路径
  }),
  serveDir: Object.freeze({
    serve: process.env.NODE_SERVE || require('path').join(__dirname, '..', '..', 'VGDesigner'), // 静态资源文件路径
    uploadImg: 'uploadImg'// 上传图片保存路径
  }),
  OK: 0, // 响应成功
  ERROR: 2, // 系统异常
  EXISTS: 1, // 数据冲突
  DATA404: "Data don't exist!",
  DATA_EXIST: 'Data already exists!',
  MISSING_ID: 'Please provide id!',
  SUBMIT_IS_EMPTY: 'Submitted data is empty!',
  SYS_ERR: 'System Error!',
  ARANGO_HOST: process.env.ARANGODB_HOST || 'localhost',
  ARANGO_PORT: process.env.ARANGODB_PORT || 8529,
  ARANGO_USERNAME: process.env.ARANGODB_USERNAME || 'test',
  ARANGO_PASSWORD: process.env.ARANGODB_PASSWORD || 'test',
  ARANGO_DB: process.env.ARANGODB_DB || 'designer'
})
