module.exports = {
  // 路径前缀
  publicPath: './',
  lintOnSave: true,
  productionSourceMap: false,
  devServer: {
    proxy: {
      '/apis': {
        target: 'https://cs.51qqt.com/qqt-srm/rest',
        ws: true,
        changOrigin: true,
        pathRequiresRewrite: {
          '^/apis': '/'
        }
      }
    }
  }
};
