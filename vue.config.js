module.exports = {
  // 路径前缀
  publicPath: './',
  lintOnSave: true,
  productionSourceMap: false,
  devServer: {
    port: 8080,
    disableHostCheck: true,
    proxy: {
      '/apis/': {
        // 这里最好有一个/
        target: 'http://cs.51qqt.com/ELSServer_SRM/rest', // 后台接口域名
        secure: false, // 如果是https接口，需要配置这个参数
        changeOrigin: true, // 是否跨域
        pathRewrite: {
          '^/apis/': '/'
        }
      }
    }
  }
};
