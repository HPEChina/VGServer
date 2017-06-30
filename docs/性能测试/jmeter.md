jmeter -n -t "C:\Users\wajianhu\Documents\DOC\jmeter\开发环境测试\保存topo - local.jmx" -l C:\Users\wajianhu\Documents\DOC\jmeter\result.csv -e -o C:\Users\wajianhu\Documents\DOC\jmeter\ResultReport -H [your.proxy.server] -P [your proxy server port]

资源监控:nohup /opt/ServerAgent-2.2.1/startAgent.sh --udp-port 0 --tcp-port 3450 &

参数说明:

-n : 非GUI 模式执行JMeter

-t : 执行测试文件所在的 位置

-l : 指定生成测试结果的保存文件， jtl 文件格式

-e : 测试结束后，生成测试报告

-o : 指定测试报告的存放位置

-l -o 指定的文件及文件夹，必须 不存在 ，否则执行会失败

arango并发数据保存耗时10s，导致大量数据排队最终内存溢出

<--- Last few GCs --->

[9116:00000000003BC3A0]  2562728 ms: Mark-sweep 1298.0 (1511.2) -> 1297.7 (1511.
2) MB, 94.0 / 0.0 ms  allocation failure GC in old space requested
[9116:00000000003BC3A0]  2562821 ms: Mark-sweep 1297.7 (1511.2) -> 1297.7 (1468.
7) MB, 93.0 / 0.0 ms  last resort
[9116:00000000003BC3A0]  2562946 ms: Mark-sweep 1297.7 (1468.7) -> 1297.5 (1458.
2) MB, 125.0 / 0.0 ms  last resort


<--- JS stacktrace --->

==== JS stack trace =========================================

Security context: 0000012FFA4E69B9 <JS Object>
    1: _writeGeneric [net.js:709] [pc=0000017851FFD5B2](this=0000000AC1188D49 <a
 Socket with map 0000025EE952B761>,writev=00000242515023B1 <true>,data=000000B44
807DA19 <JS Array[2]>,encoding=0000024251502471 <String[0]: >,cb=000001FCFD2D6D8
9 <JS BoundFunction (BoundTargetFunction 000002164D00C6E9)>)
    2: doWrite(aka doWrite) [_stream_writable.js:~321] [pc=00000178520ED763](thi
s=000002425150...

FATAL ERROR: CALL_AND_RETRY_LAST Allocation failed - JavaScript heap out of memo
ry
