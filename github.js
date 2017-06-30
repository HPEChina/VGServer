/*
set GITHUB_USERNAME=<***>
set GITHUB_PASSWORD=<***>
set HTTP_PROXY=http://web-proxy.houston.hp.com:8080/
set HTTPS_PROXY=http://web-proxy.houston.hp.com:8080/
// set HTTP_PROXY=http://openproxy.huawei.com:8080/
// set HTTPS_PROXY=http://openproxy.huawei.com:8080/
// netsh winhttp import proxy source=ie
npm i github
.\n github <path>
*/
let content = ''
const file=require('path').resolve(process.argv[2])//基于执行路径获取绝对路径
try {
    content = require('fs').readFileSync(file)
} catch (e) {
    console.log('文件不存在')
    return
}
async function app() {
    const github = new require("github")();
    github.authenticate({
        type: "basic",
        username: process.env.GITHUB_USERNAME,
        password: process.env.GITHUB_PASSWORD
    })

    try {
        const result = await github.repos.createFile({
            owner: 'HPEChina',
            repo: 'Demo',
            path: file.split(/(\/|\\)/).pop(),
            message: 'ADD ' + file.split(/(\/|\\)/).pop(),
            content: content.toString('base64')
        })
        console.log(result.meta)
    } catch (err) {
        console.log(err)
    }
}
app()
