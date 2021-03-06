# ModelDesigner

## TODOS

-   java解惑
-   vscode snippets 代码片段定制
-   wasm node
-   详细问题及开发日志规范
-   arango配置移入config 常量状态/提示信息移入config,添加属性不可修改标识
-   img base64上传
-   故障恢复同步?404时同步?
-   各组建性能优化/缓存 node db nginx 前端
-   图片上传resize
-   arango文档
-   图结构
-   父子关系
-   软删除(get过滤软删除数据) 事务

## 升级

```bash
sed -i 's/\r//' /mnt/publish/VGServer/upgrade.sh
chmod 655 /mnt/publish/VGServer/upgrade.sh
/mnt/publish/VGServer/upgrade.sh
```

## 架构

-   服务端开发语言： [Node.js v4](https://nodejs.org/zh-cn)
-   Web开发： [Koa v2](https://github.com/koajs/koa)
-   页面渲染： [React](https://facebook.github.io/react)
-   数据库： [ArangoDB](https://www.arangodb.com)
-   代码检查： [CodeMirror](http://codemirror.net)
-   数据格式转换： [JS-YAML](https://github.com/nodeca/js-yaml)
      [xml2js](https://github.com/Leonidas-from-XIV/node-xml2js)(xml&lt;==>json&lt;==>yaml)
-   网络拓扑： [mxGraph](https://github.com/jgraph/mxgraph)

## 关于性能

-   数据传输： Gulp 代码压缩、 Gzip 压缩、 ServiceWorker离线访问
-   系统服务： nginx 静态资源代理、请求转发
-   数据传输格式； 压缩版 json [JSONH](https://github.com/WebReflection/JSONH)

## 关于数据

    ```
    server:         XML<==>JSON<==>YAML (如有必要)
                             │
    network:               JSONH
                             │
    browser: XML(源数据)<==>JSON(传输数据)<==>yaml(目标数据)
    ```

## API

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

### server.js

入口文件

**Meta**

-   **version**: 1.0.0
-   **copyright**: DXC 2017

-   **author**: Wang Jianhui &lt;jianhui.wang@hpe.com>

### addClass

添加模型分类

**Parameters**

-   `className` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** 分类名称
-   `description` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** 描述信息

### 数据库集合

### constructor

Creates an instance of Collection.

**Parameters**

-   `collectionName` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** 数据库集合名称

### get

数据库查询

**Parameters**

-   `ctx` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** koa 上下文
-   `next` **[function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)** koa 中间件级联

### save

添加数据库记录

**Parameters**

-   `ctx` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** koa 上下文
-   `data` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** 要保存到数据库中的数据

### update

数据库记录更新

**Parameters**

-   `ctx` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** koa 上下文
-   `data` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** 要更新到数据库中的数据

### del

删除数据库记录

**Parameters**

-   `id` **[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** 待删除记录的ID

### config

配置文件

Type: [object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)

### hash

Node.JS Hash 算法封装

**Parameters**

-   `str` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** 要进行 hash 运算的字符串
-   `algorithm` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)**  (optional, default `'md5'`)
-   `encoding` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)**  (optional, default `'hex'`)
-   `inputEncoding` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)**  (optional, default `'utf8'`)

### index

发送lcm请求

**Parameters**

-   `ctx` **[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** koa 上下文

#### isArrays

判断非空数组

**Parameters**

-   `o` **any** 

#### isFalse

判断无效数据
假值:undefined,null,0,+0,-0,NaN,'',"",false
空对象:{}
空数组:\[]

**Parameters**

-   `o` **any** 

### ComplexType

数据类型判断

**Parameters**

-   `o` **any** 

**Examples**

```javascript
// returns 'Undefined'
ComplexType(undefined)
typeof o === 'undefined'
isNaN(o)
```

```javascript
// returns 'Null'
ComplexType(null)
o === null
```

```javascript
// returns 'Array'
ComplexType([])
Array.isArray([])
```

```javascript
// returns 'String'
ComplexType('')
typeof '' === 'string'
```

```javascript
// returns 'Number'
ComplexType(1)
typeof 1 === 'number'
```

```javascript
// returns 'Boolean'
ComplexType(true)
typeof true === 'boolean'
```

```javascript
// returns 'Function'
ComplexType(function(){})
typeof function(){} === 'function'
```

```javascript
// returns 'Object'
ComplexType({})
```

```javascript
// returns 'Date'
ComplexType(new Date())
```

```javascript
// returns 'RegExp'
ComplexType(/./)
```

Returns **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** 

### isObjects

判断非空对象

**Parameters**

-   `o` **any** 

### graph2data

图形转数据

**Parameters**

-   `body` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** 获取的请求数据

Returns **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** 图形数据结构的JSON字符串

### xml2data

nodejs xml模型转数据

**Parameters**

-   `xml` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** 模型XML字符串

Returns **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)>** 模型数据结构的resources对象

**Meta**

-   **version**: 3.0.0

### js2data

JSON图形转数据,nodejs json拓扑转数据模块
画图规则:parent在前,child在后(先定义后使用)
转换规则:
1\. 无空{}
2\. topo忽略底板,只保留底板静态属性作为topo属性
3\. kill三无,没意义(properties\\operand)&没关系(relations)&没后代(嵌套子模型)
4\. 忽略id=1
5\. 模型name为底板name,topo name为filename
6\. 模型忽略保存时强制加组(parent=1的强加组被移除,强加组的子节点无父节点),topo忽略底板
7\. 性能考虑,暂不处理嵌套多层均为空的情况

**Parameters**

-   `json` **\[[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)]** 图形json数组
-   `envType` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** 环境类型 model OR topo,浏览器参数

### getAttrs

获取图元属性

**Parameters**

-   `modelID` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** 图元ID
-   `model` **[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** 图元JSON

### getEdge

获取topo连线

**Parameters**

-   `modelID` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** 图元ID
-   `model` **[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** 图元JSON

### getOperand

解析动态属性

**Parameters**

-   `prop` **[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** 动态属性

### findDevice

获取连线设备

**Parameters**

-   `resources` **[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** 图元集合
-   `sid` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** 连线 source ID
-   `tid` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** 连线 target ID

### list2tree

生成嵌套结构

**Parameters**

-   `resources` **[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** 图元集合
-   `ids` **\[[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)]** 图元ID数组

### objValues

Object.values(obj)

**Parameters**

-   `obj` **[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** 嵌套结构图元集合

Returns **\[[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)]** 图元数组
