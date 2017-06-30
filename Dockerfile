#docker(容器虚拟化)镜像构建文档
#基于 Alpine 镜像(5MB Linux Image)
FROM openresty/openresty:alpine
#镜像维护者
MAINTAINER wangjh <wangjianhui8@huawei.com>
#设置环境变量
ENV NODE_ENV production
#将源路径中的内容复制到镜像新的一层的目标路径
COPY . /root
#工作空间
WORKDIR /root
#在基础镜像执行命令
#在 Alpine 安装 node nginx，禁用缓存，--virtual 统一管理依赖
RUN apk add --no-cache nodejs \
    && mv docker.package.json package.json \
    && npm i \
    && npm ddp \
    && npm cache clean  \
    && rm -rf /tmp/* /usr/lib/node_modules
COPY conf/nginx.conf /usr/local/openresty/nginx/conf/nginx.conf
#Container启动时执行,一个Dockerfile中只能有一条CMD
ENTRYPOINT /usr/local/openresty/bin/openresty && npm start
