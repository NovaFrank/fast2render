const path = require('path');
const { name } = require('./package');

function resolve(dir) {
  return path.join(__dirname, dir);
}

module.exports = {
  // 路径前缀
  publicPath: './',
  lintOnSave: true,
  productionSourceMap: false,
  chainWebpack: (config) => {
    // 忽略的打包文件
    config.externals({
      vue: 'Vue',
      'vue-router': 'VueRouter',
      vuex: 'Vuex',
      axios: 'axios',
      avue: 'Avue',
      'vue-i18n': 'VueI18n',
      'element-ui': 'ELEMENT'
    });
  },
  devServer: {
    port: 8087,
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
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache'
    }
  },
  // 自定义webpack配置
  configureWebpack: {
    resolve: {
      alias: {
        '@': resolve('src')
      }
    },
    output: {
      // 把子应用打包成 umd 库格式
      library: `${name}-[name]`,
      libraryTarget: 'umd',
      jsonpFunction: `webpackJsonp_${name}`
    }
  }
};
