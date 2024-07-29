export default {
    // 配置显示在浏览器标签的title
    projectTitle: '个人博客',
    cookieExpires: 365 * 24 * 60 * 60 * 1000, // 设置 365天
    // api请求基础路径
    baseUrl: {
      dev: ' http://localhost:9080',
      // pro：即线上的IP地址和端口，需要和nginx监听的地址、端口保持一致
      pro: 'http://localhost:8999'
    },
    // 默认打开的首页的路由name值，默认为home
    homeName: 'Home',
    // 需要加载的插件
    plugin: {
      'error-store': {
        showInHeader: true, // 设为false后不会在顶部显示错误日志徽标
        developmentOff: true // 设为true后在开发环境不会收集错误信息，方便开发中排查错误
      }
    },
    prefixUrl: '/blog-api/'
  }
