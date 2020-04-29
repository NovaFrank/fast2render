module.exports = {
  // 路径前缀
  publicPath: './',
  lintOnSave: true,
  productionSourceMap: false,
  devServer: {
    proxy: {
      '/apis/': {
        // target: 'http://cs.51qqt.com/ELSServer_SRM',
        target: 'http://cs.51qqt.com/ELSServer_SRM/rest',
        ws: false,
        changOrigin: true,
        pathRewrite: {
          '^/apis/': '/'
        }
      },
      '/layout/': {
        // target: 'http://localhost:1337',
        target: 'http://www.fast2.cn:1337',
        ws: false,
        changOrigin: true,
        pathRewrite: {
          '^/layout/': '/'
        }
      }
    }
  }
};
