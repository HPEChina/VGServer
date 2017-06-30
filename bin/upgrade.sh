# export NODE_ENV=production
# export HUAWEI_HOST=http://service-sdv.lcm.huawei.com/topology/hutaf-topology/v1/
# export ARANGODB_USERNAME=
# export ARANGODB_PASSWORD=
# export ARANGODB_DB=
# export MONGO_DB=mongodb://122.115.49.92:27017,122.115.49.90:27017,122.115.49.75:27017/designer?replicaSet=designer
# export VGD_ROOTDIR=/mnt
# export NODE_SERVE=$VGD_ROOTDIR/editor/VGDesigner
# export NODE_PARTNER=127.0.0.1

# sed -i 's/\r//' $VGD_ROOTDIR/publish/VGServer/upgrade.sh
# chmod 655 $VGD_ROOTDIR/publish/VGServer/upgrade.sh
# $VGD_ROOTDIR/publish/VGServer/upgrade.sh

nginx -s stop
pm2 kill
\cp -rf $VGD_ROOTDIR/editor $VGD_ROOTDIR/editor$(date +%Y%m%d)
\cp -rf $VGD_ROOTDIR/publish/* $VGD_ROOTDIR/editor
\rm -rf $VGD_ROOTDIR/publish
cd $VGD_ROOTDIR/editor/VGServer
npm config rm proxy
npm config rm http-proxy
npm config rm https-proxy
npm config set no-proxy .huawei.com
npm config set registry http://rnd-mirrors.huawei.com/npm-registry/
\cp -f /etc/nginx/nginx.conf /etc/nginx/nginx.conf$(date +%Y%m%d)
\cp -f ./nginx.conf /etc/nginx/nginx.conf
\mv -f ~/.pm2/logs $VGD_ROOTDIR/editor$(date +%Y%m%d)/logs
npm i
# pm2 update
# pm2 restart pm2.json --update-env
pm2 start pm2.json
nginx
# nginx -s reload
pm2 logs server
