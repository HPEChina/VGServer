
const fs = require('fs')
const path = require('path')
async (ctx, next) => {
  if (!Object.keys(ctx.request.body).length) ctx.request.body = ctx.request.query
  let imgName = '', imgDir = '', imgData = decodeURIComponent(ctx.request.body.data)
  imgData = imgData.match(/^data:image\/(\w+);base64,(.+)$/)
  if (!imgData || !imgData[2]) { return ctx.throw(417, 'Submitted data is not image!', { body: { status: 2, data: { msg: 'Submitted data is not image!' } } }) }
  imgData = imgData[2].replace(/\s/g, '+')
  let imgPath = path.join(config.serveDir.serve, config.serveDir.uploadImg)
  const crypto = require('crypto')
  const md5 = crypto.createHash('md5')
  const sign = md5.update(imgData, 'utf8').digest('hex')
  imgData = new Buffer(imgData, 'base64')
  try {
    const img = await files.document(sign)
    imgDir = img.imgDir || ''
    imgName = img.imgName
  } catch (e) {
        // try {
        //     console.log(await require('sharp')(imgData).metadata)
        // } catch (e) {
    imgDir = new Date().getFullYear() + '-' + new Date().getMonth()
        // }
    const imgMeta = imageSize(imgData)
    imgName = sign + '_' + imgMeta.width + 'x' + imgMeta.height + '.' + imgMeta.type
    if (process.env.NODE_ENV == 'development') await files.save({ _key: sign, imgDir: imgDir, imgName: imgName })
  }
  try {
    fs.accessSync(path.join(imgPath, imgDir, imgName))
  } catch (e) {
    if (!fs.existsSync(imgPath)) fs.mkdirSync(imgPath)
    imgPath = path.join(imgPath, imgDir)
    if (!fs.existsSync(imgPath)) fs.mkdirSync(imgPath)
    const saveImg = new Promise((resolve, reject) => fs.writeFile(path.join(imgPath, imgName), imgData, 'base64', (err) => err ? reject(err) : resolve('OK')))
    if (await saveImg != 'OK') { return ctx.body = { status: 2, data: { msg: 'SYS_ERR' } } }
  }
  ctx.request.body = { url: imgDir + '/' + imgName }
  response(ctx, next)
}
