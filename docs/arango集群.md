#管理

ps auxw | fgrep arangod
kill -2 `pidof arangod`

#架构
CP:内部一致性优于高可用
master/master:主主备份,客户端可以发送请求到任意节点
无单点故障
##角色 
Agents:通过一个公共 Agent 彼此通信,集群核心,外部不可访问,配置信息管理,数据同步,leader 选举,raft 实现,必须为奇数,多数agent能收到某DBserver的心跳就证明该agent活着.
Coordinators:客户端可访问,保存数据分片存放位置,任务调度,无状态,可按需关闭或重启,向 Agents 发送心跳
Primary DBservers:由coordinator调用,执行查询和数据存储,彼此通信,向 Agents 发送心跳
Secondary DBservers:异步复制 Primary,不影响 Primary 性能,最终一致
除Agents外,其他arango实例启动时都会被分配一个ID,用于通信识别
##策略
默认:每个主机运行一个 coordinator 和一个 primary :主主配置,对等网络,客户端可以发送请求到任意节点
DBservers > coordinators:存储容量>查询效率 
DBservers < coordinators:Foxx services,在coordinators进行大量CPU计算
每个nodejs服务器上部署一个 coordinator,Agents and DBservers 部署在其他服务器:降低数据库和应用服务器之间的网络延迟
##同步复制和自动故障转移
每个集合的每个分片在集群中都保存了多个副本,其中一个副本被声明为 leader,其他的为 followers;
对分片的写操作总是被发送到存有leader副本的 DBserver,leader DBserver 依次将更改同步到所有 followers以完成操作,并向 coordinator 汇报结果;
读操作由leader副本的 DBserver处理,复杂操作可以提供快照
当持有分片的 follower 副本的 DBServer故障, leader 不再向其同步更改,并在3秒后将其遗弃,当该server恢复,他会自动从leader 重新同步数据
当持有分片的leader 副本的 DBserver 故障，leader 不再响应任何请求，不再向 Agency 发送心跳，心跳消失15秒后，Agency 的监控进程会选举一个持有  in-sync 副本的 server 作为该分片的 leader,Agency 中会进行 reconfiguration，coordinators会将对该分片的请求指向新 leader DBserver，其他副本自动从新 leader同步数据。当原leader恢复，它将作为 follower 从新 leader 同步数据。
所有数据同步都是增量的，这允许在不中断服务的前提下实现DBservers 间分片转移，将一个DBserver中的所有数据迁移到其他DBservers，并关闭该server，缩减集群规模。可以实现自动或手动调整分片分布。
同步复制会增加写操作的延迟，对于不重要数据可以通过将replication 设置为1，关闭同步复制，解决写操延迟。
##异步复制和自动故障转移
异步复制由primary and secondary DBservers实现,每个secondary server 使用异步轮询的方式复制primary 中的所有数据,这一过程对primary的性能影响很小,但在写操作结果返回给客户端和数据实际同步完成之间存在延迟,延迟期间master server 一旦发生故障可能导致数据丢失.
异步复制的故障转移在集群外部完成(以后可能会将这部分工作交给Agency的监控进程),目前只能通过Mesos的ArangoDB 调度器完成.
异步复制不支持增量和分片转和(The granularity of the replication is a whole ArangoDB instance with all data that resides on that instance),这意味着需要两倍于不使用异步复制所需的instances,而同步复制对instances的需求更富有弹性,一旦有节点异常,数据可以在其他节点间重新分配.
##Agency 配置
激活 Agency:
--agency.activate true
容错模式,至少3个 Agency:
--agency.size 3 
选举公共 Agency:
--agency.endpoint tcp://127.0.0.1:5001
对外声明自己的地址:
--agency.my-address=tcp://127.0.0.1:5003

arangod --server.endpoint tcp://0.0.0.0:5001 --agency.my-address=tcp://127.0.0.1:5001 --server.authentication false --agency.activate true --agency.size 3 --agency.endpoint tcp://127.0.0.1:5001 --agency.supervision true --database.directory agency1 
arangod --server.endpoint tcp://0.0.0.0:5002 --agency.my-address=tcp://127.0.0.1:5002 --server.authentication false --agency.activate true --agency.size 3 --agency.endpoint tcp://127.0.0.1:5001 --agency.supervision true --database.directory agency2 
arangod --server.endpoint tcp://0.0.0.0:5003 --agency.my-address=tcp://127.0.0.1:5003 --server.authentication false --agency.activate true --agency.size 3 --agency.endpoint tcp://127.0.0.1:5001 --agency.supervision true --database.directory agency3

##Coordinators and DBServers 配置
指定角色
--cluster.my-role PRIMARY(DB Server)/COORDINATOR(对外服务)
指定名称
--cluster.my-local-info db1
对外声明自己的地址:
--cluster.my-address tcp://127.0.0.1:8530
arangod --server.authentication=false --server.endpoint tcp://0.0.0.0:8529 --cluster.my-address tcp://127.0.0.1:8529 --cluster.my-local-info db1 --cluster.my-role PRIMARY --cluster.agency-endpoint tcp://127.0.0.1:5001 --cluster.agency-endpoint tcp://127.0.0.1:5002 --cluster.agency-endpoint tcp://127.0.0.1:5003 --database.directory primary1 &
arangod --server.authentication=false --server.endpoint tcp://0.0.0.0:8530 --cluster.my-address tcp://127.0.0.1:8530 --cluster.my-local-info db2 --cluster.my-role PRIMARY --cluster.agency-endpoint tcp://127.0.0.1:5001 --cluster.agency-endpoint tcp://127.0.0.1:5002 --cluster.agency-endpoint tcp://127.0.0.1:5003 --database.directory primary2 &
arangod --server.authentication=false --server.endpoint tcp://0.0.0.0:8531 --cluster.my-address tcp://127.0.0.1:8531 --cluster.my-local-info coord1 --cluster.my-role COORDINATOR --cluster.agency-endpoint tcp://127.0.0.1:5001 --cluster.agency-endpoint tcp://127.0.0.1:5002 --cluster.agency-endpoint tcp://127.0.0.1:5003 --database.directory coordinator &

##Secondaries 配置(异步复制)
curl -f -X PUT --data '{"primary": "DBServer001", "oldSecondary": "none", "newSecondary": "Secondary001"}' -H "Content-Type: application/json" http://127.0.0.1:8531/_admin/cluster/replaceSecondary && arangod --server.authentication=false --server.endpoint tcp://0.0.0.0:8629 --cluster.my-id Secondary001 --cluster.my-address tcp://127.0.0.1:8629 --cluster.agency-endpoint tcp://127.0.0.1:5001 --cluster.agency-endpoint tcp://127.0.0.1:5002 --cluster.agency-endpoint tcp://127.0.0.1:5003 secondary1 &
curl -f -X PUT --data '{"primary": "DBServer002", "oldSecondary": "none", "newSecondary": "Secondary002"}' -H "Content-Type: application/json" http://127.0.0.1:8531/_admin/cluster/replaceSecondary && arangod --server.authentication=false --server.endpoint tcp://0.0.0.0:8630 --cluster.my-id Secondary002 --cluster.my-address tcp://127.0.0.1:8630 --cluster.agency-endpoint tcp://127.0.0.1:5001 --cluster.agency-endpoint tcp://127.0.0.1:5002 --cluster.agency-endpoint tcp://127.0.0.1:5003 secondary2 &

有四种不同的 ArangoDB 任务：

Agency 任务：Agency 是一个中心化，低数据量，低IO的数据存储，主要存储了 ArangoDB 集群的配置以及数据库/集合的摘要信息。 Agency 也使用了 Raft 一致性协议来维护集群层面的日志同步操作和锁操作。Agency 的数据变化不频繁，但是对整个集群的运转特别重要。这也意味着 Agency 的数据需要使用持久化卷，但是 IO 性能并不重要。
Coordinator 任务：Coordinator 任务就是面向客户端的 ArangoDB 实例。它们本质上是无状态的：它们接受外部的 HTTP 请求，通过 Agency 了解集群的配置，并将 query 操作分发到集群中。Coordinator 知道集群切片的细节，从而能够制定分布式的query执行策略，并管理它们的运行状况。
主数据服务任务：主数据服务器保存了真正的数据。这些任务状态频繁变化，有很重的数据IO操作。从而，这些任务需要持久化卷和很好的磁盘IO性能。
备数据服务任务： 备数据服务器是主数据服务器的异步分片。它们有规律的轮训主数据服务器的变化并将这些变化应用到它们的数据备份上，所以它们也需要持久化卷。另外，如果主数据服务器崩溃了，它的备数据服务器能够立刻接管。
ArangoDB 调度器的职责
ArangoDB集群按下面的顺序加载：

加载 Agency 任务。
主数据服务器启动。
备数据服务器在主数据服务器之后启动，确保其不与主数据服务器运行在同一个节点上。
Coordinator 任务启动。
在所有的任务启动并运行正常后，ArangoDB 集群执行初始化。
在下面的情况下，ArangoDB 调度器也需要采取行动并维护类似的依赖需求：

集群需要在数据服务器层面伸缩来改变它的数据存储能力。
集群需要在 Coordinator 层面伸缩来改变它的 query 能力。
集群需要不停服升级。
集群需要重启。
ArangoDB 调度器也需要进行失败处理。接到 Mesos master 的任务被杀或者 Mesos 节点失联的通知后，调度器需要自动的进行失败处理。为了进行失败处理，调度器会监听集群中任务的状态，维护时间戳，并进行超时处理。

ArangoDB 通过一个事件轮训的主程序来完成上述功能。这个主程序周期性从其他线程获取资源 offer，接受 Mesos 的更新信息，维护超时处理和事件响应。我们会在下面详细讨论这里的技术细节。
