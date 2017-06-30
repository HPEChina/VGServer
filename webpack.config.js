// webpack(js模块加载器)配置文件
const webpack = require('webpack')

module.exports = {
  entry: './views/index.js', // webpack 入口文件
  output: {
    path: 'docs',
    filename: 'ui.js'
  },
  resolve: {
    extensions: ['.js']// 自动扩展文件后缀名，require模块可以省略不写后缀名
  },
  module: {
    loaders: [// 模块/资源加载转换器,通过 require 加载任意类型模块或文件，解析打包成js文件
      {
        test: /\.(js|jsx)$/, // 正则表达式匹配要处理的文件
        loader: 'babel', // 要使用的 loader
        query: {// loader 参数
          babelrc: true, // 使用 .babelrc 中的设置
          presets: ['react'],
          cacheDirectory: true// 启用缓存
        },
        exclude: /(node_modules|bower_components)/// 排除不处理的目录
      }
    ]
  },
  plugins: [// plugin比loader功能更强大，能使用更多的wepack api
    new webpack.DefinePlugin({// 定义编译时全局常量
      'process.env': {// 环境变量
        NODE_ENV: JSON.stringify('production')
      }
    })
  ]
}
