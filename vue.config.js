const { defineConfig } = require('@vue/cli-service')
const AutoImport = require('unplugin-auto-import/webpack')
const Components = require('unplugin-vue-components/webpack')
const { ElementPlusResolver } = require('unplugin-vue-components/resolvers')

// module.exports = defineConfig({
//   transpileDependencies: true
// })
// const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const path = require('path')

const resolve = dir => {
  return path.join(__dirname, dir)
}

module.exports = defineConfig({

  // publicPath: './',  // 基本路径
  // outputDir: 'dist', // 构建时的输出目录
  // assetsDir: 'static', // 放置静态资源的目录
  // indexPath: 'index.html', // html 的输出路径
  // filenameHashing: true, // 文件名哈希值
  // lintOnSave: false, // 是否在保存的时候使用 `eslint-loader` 进行检查。
 
  // 组件是如何被渲染到页面中的？ （ast：抽象语法树；vDom：虚拟DOM）
  // template ---> ast ---> render ---> vDom ---> 真实的Dom ---> 页面
  // runtime-only：将template在打包的时候，就已经编译为render函数
  // runtime-compiler：在运行的时候才去编译template
  // runtimeCompiler: false,

  productionSourceMap: false,
  transpileDependencies: true,
  publicPath: './',
  // 如果你不需要使用eslint，把lintOnSave设为false即可
  lintOnSave: true,
  chainWebpack: config => {
    config.resolve.alias
      .set('@', resolve('src')) // key,value自行定义，比如.set('@@', resolve('src/components'))
      .set('_c', resolve('src/components'))
  },
 
  devServer: {
    open: true, // 编译后默认打开浏览器
    // host: '0.0.0.0',  // 域名
    port: 9080,
    https: false,  // 是否https
    // 显示警告和错误
    // overlay: {
    //   warnings: false,
    //   errors: true
    // },
    proxy: {
      '/blog-api': {
        target: 'http://localhost:9000/',
        // ws: true,
        changeOrigin: true,
        pathRewrite: { // 将 blog-api 替换为空，即去掉 blog-api，例如：http://localhost:8080/blog-api/demo替换后为http://localhost:8080/demo
          '^/blog-api': ''
        }
      }
      // '/foo': {
      //   target: '<other_url>'
      // }
    }
  },
  configureWebpack: {
    plugins: [  //element-plus
      AutoImport({
        resolvers: [ElementPlusResolver()],
      }),
      Components({
        resolvers: [ElementPlusResolver()],
      }),
    ],
    resolve: {
        symlinks: false,
        alias: {
            vue: path.resolve('./node_modules/vue') //解决Vue冲突的问题 报错：Cannot read property 'parentNode' of null  TypeError: Cannot read property 'parentNode' of null
        }
    },
    plugins: [
        //打包环境去掉console.log等
        /* @author icestone , 17:22
         * @date 2023/5/15
         * 下面这个应该在打包时才打开,开发时不要打开,编译消耗很多时间
        */
        /*new UglifyJsPlugin({
            uglifyOptions: {
                compress: {
                    //warnings: false, 注释不然打包会报错如图下图
                    drop_console: true,  //注释console
                    drop_debugger: true, //注释debugger
                    pure_funcs: ['console.log'], //移除console.log
                },
            },
        })*/
    ],
    output: {
        libraryExport: '../behind/src/static'
    },
  }
})