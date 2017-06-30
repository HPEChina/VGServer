#!/bin/bash

targetDir="/mnt"
fileName="publish"
ftpUser=ilcm
ftpPassword=ilcm
ftpUrl="ftp://10.93.182.223/lcmfile/"
\rm -rf $targetDir/editor$(date +%Y%m%d)
\mv -f $targetDir/editor $targetDir/editor$(date +%Y%m%d)

cd $targetDir && wget --ftp-user $ftpUser --ftp-password $ftpPassword $ftpUrl$fileName

if [ $? -eq 0 ];then
	nginx -s stop
	pm2 stop server
	export NODE_ENV=production
	export NODE_SERVE=/mnt/editor/VGDesigner
	\mv $targetDir/publish $targetDir/editor
	\cp -rf $targetDir/editor$(date +%Y%m%d)/VGDesigner/uploadImg/* $targetDir/editor/VGDesigner/uploadImg
	cd $targetDir/editor/VGServer
	# npm config rm proxy
	# npm config rm http-proxy
	# npm config rm https-proxy
	# npm config set no-proxy .huawei.com
	# npm config set registry http://rnd-mirrors.huawei.com/npm-registry/
	\rm -rf /etc/nginx/nginx.conf$(date +%Y%m%d)
	\mv -f /etc/nginx/nginx.conf /etc/nginx/nginx.conf$(date +%Y%m%d)
	\mv ./nginx.conf /etc/nginx/nginx.conf
	npm i
	pm2 update
	pm2 restart pm2.json --update-env
	nginx
	nginx -s reload
else
	echo "file download failed"
fi	

rm -rf $fileName
