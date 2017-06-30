REM set HUAWEI_HOST=
REM set ARANGODB_HOST=
REM set ARANGODB_PORT=
REM set ARANGODB_USERNAME=
REM set ARANGODB_PASSWORD=
REM set ARANGODB_DB=
REM set MONGO_DB=mongodb://127.0.0.1:27017,127.0.0.1:27017,127.0.0.1:27017/designer?replicaSet=designer
REM tskill nginx
REM tskill node
REM tskill arangod
set HTTP_PROXY=http://web-proxy.houston.hp.com:8080/
set HTTPS_PROXY=http://web-proxy.houston.hp.com:8080/
REM nvm node_mirror https://npm.taobao.org/mirrors/node/
REM nvm npm_mirror https://npm.taobao.org/mirrors/npm/
call bin\rust.bat
set HTTP_PROXY=
set HTTPS_PROXY=
REM set ICU_DATA=C:\Users\wajianhu\Downloads\ArangoDB\usr\share\arangodb3\
REM start arangod --javascript.v8-options="--max_old_space_size=2048"
REM cd C:\Users\wajianhu\Downloads\nginx
REM start nginx
cd C:\Users\wajianhu\Documents\GitHub\lab2012
set NODE_ENV=development
set NODE_SERVE=C:\Users\wajianhu\Documents\GitHub\VGDesigner
set NODE_LOG=true
REM call node_modules\.bin\webpack 
call node_modules\.bin\gulp
REM mklink /J "..\Demo\publish\VGServer\node_modules" "node_modules"
REM cd ..\Demo\publish\VGServer &&
node --max_old_space_size=2048 server
REM cd ..\..\..\lab2012
