set HTTP_PROXY=http://web-proxy.houston.hp.com:8080/
set HTTPS_PROXY=http://web-proxy.houston.hp.com:8080/
REM set repo=--registry=https://registry.npm.taobao.org --disturl=https://npm.taobao.org/mirrors/node
set repo=

call nvm install latest 
nvm use 8.1.2

::npm(node 包管理器)安装 node 运行时依赖
call npm i --save %repo% ^
koa-ratelimit ^
ioredis ^
image-size ^
uuid ^
axios ^
koa ^
koa-bodyparser ^
koa-compress ^
koa-logger ^
koa-router@next ^
kcors@next ^
koa-conditional-get ^
koa-etag ^
koa-static ^
arangojs
REM goto start
call npm i --save %repo% ^
htmlparser2 ^
xml2js
REM babel-plugin-transform-es2015-modules-commonjs ^
REM babel-register ^
REM koa-views ^
REM mocha ^
REM nunjucks ^
REM should ^
REM webpack ^
REM file-loader ^
REM babel-preset-es2017 ^
::npm安装 node 开发依赖
call npm i --save-dev %repo% ^
github ^
github-api ^
gulp ^
gulp-htmlmin ^
gulp-imagemin ^
gulp-clean-css ^
gulp.spritesmith ^
gulp-uglify ^
gulp-replace ^
gulp-concat ^
del ^
codemirror ^
js-yaml ^
standard ^
nyc ^
supertest ^
jasmine-core ^
karma ^
karma-jasmine ^
karma-chrome-launcher ^
documentation ^
neon-cli ^
ava 
REM babel-preset-react ^
REM react ^
REM react-dom ^
REM react-router ^
REM bower ^
REM babel-loader ^
REM css-loader ^
REM extract-text-webpack-plugin ^
REM style-loader ^
REM url-loader ^
::bower(前端包管理器)安装前端依赖
REM call node_modules\.bin\bower i --save ^
REM bootstrap ^
REM font-awesome ^
REM jquery ^
REM nedb ^
REM codemirror
REM :start
