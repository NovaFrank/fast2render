<template>
  <div class="tabBox">
    <template v-if="showList && showList.length && tabView">
      <el-tabs v-model="active">
        <template v-for="subItem in showList">
          <el-tab-pane
            :label="subItem.label"
            v-if="newPermission && subItem.prop && newPermission[subItem.prop]"
            :name="subItem.prop"
            :key="subItem.prop"
          >
            <slot :name="subItem.prop">
              <fast2-block-provider
                :option="subItem.option"
                :version="subItem.option ? null : subItem.version"
              >
                <template v-slot="component">
                  <div>
                    <fast2-component-render
                      :providerData="tabData[subItem.prop]"
                      :list="component.list"
                      :ref="subItem.prop"
                      :readOnly="readOnly"
                      :addInCell="addInCell"
                      :inTab="true"
                      :permission="newPermission[subItem.prop]"
                      :dataSource="subItem.prop"
                      v-on="$listeners"
                    ></fast2-component-render>
                  </div>
                </template>
              </fast2-block-provider>
            </slot>
          </el-tab-pane>
          <el-tab-pane :label="subItem.label" v-else :name="subItem.prop" :key="subItem.prop">
            <slot :name="subItem.prop"></slot>
          </el-tab-pane>
        </template>
      </el-tabs>
    </template>
    <template v-if="showList && showList.length && !tabView">
      <template v-for="subItem in showList">
        <div
          class="tab-block"
          :key="subItem.prop"
          v-if="newPermission && newPermission[subItem.prop]"
        >
          <h4 class="block-title">{{ subItem.label }}</h4>
          <slot :name="subItem.prop">
            <fast2-block-provider
              :option="subItem.option"
              :version="subItem.option ? null : subItem.version"
            >
              <template v-slot="component">
                <div>
                  <fast2-component-render
                    :providerData="tabData[subItem.prop]"
                    :list="component.list"
                    :ref="subItem.prop"
                    :readOnly="readOnly"
                    :addInCell="addInCell"
                    :permission="newPermission[subItem.prop]"
                    :dataSource="subItem.prop"
                    v-on="$listeners"
                  ></fast2-component-render>
                </div>
              </template>
            </fast2-block-provider>
          </slot>
        </div>
        <div :label="subItem.label" v-else :name="subItem.prop" :key="subItem.prop">
          <slot :name="subItem.prop"></slot>
        </div>
      </template>
    </template>
  </div>
</template>
<script>
/**
 * 界面配置总管理界面
 * 左侧 维护 所有可配数据列表
 * 主内容根据 可配数据类型 展示 表单，表格，详情，组件列表管理，可选择设置对应的数据
 * 进入屏蔽其他操作状态，单纯进行布局， 保存 及 发布 ， 可维护类型为 表格 表单 详情， 组合， 可 维护 模版 页面  模块
 * block 内含一组组件
 */
// import { test } from '../demo/template.js';
import { zhunru } from '../demo/template2.js';
import permisssion from '../demo/tableJson3';
export default {
  name: 'ConfigTabRender',
  props: {
    list: {
      type: Array,
      default: () => {
        return [];
      }
    },
    debugger: {
      type: Boolean,
      default: false
    },
    readOnly: {
      type: Boolean,
      default: false
    },
    addInCell: {
      type: Boolean,
      default: true
    },
    tabView: {
      type: Boolean,
      default: true
    },
    tabPermission: {
      type: Object,
      default: () => {
        return {};
      }
    },
    providerData: {
      type: Object,
      default: () => {
        return {
          tableData: []
        };
      }
    }
  },
  data() {
    return {
      tableObj: {},
      tableData: {},
      formData: {},
      active: '',
      newList: [],
      newPermission: {}
    };
  },
  watch: {
    list: {
      handler(val) {
        this.newList = val;
      },
      deep: true,
      immediate: true
    },

    tabPermission: {
      handler(val) {
        this.newPermission = val;
      },
      deep: true,
      immediate: true
    }
  },
  computed: {
    tabData() {
      if (!this.readOnly) {
        this.newList.map((item) => {
          if (!this.providerData[item.prop]) {
            this.providerData[item.prop] = {
              tableData: []
            };
          }
        });
      }
      return this.providerData;
    },
    showList() {
      const list = Object.keys(this.newPermission);
      if (this.newList.length && list.length) {
        const showList = this.newList.filter((item) => {
          return !!this.newPermission[item.prop];
        });
        return showList;
      } else {
        // 无权限配置 ，不展示任何tab
        // return this.newList;
        return []
      }
    }
  },
  mounted() {
    console.log('启动tab组件');
    if (this.debugger === 'true') {
      this.newList = zhunru;
      this.newPermission = permisssion;
    }
    this.checkInited();
  },
  methods: {
    checkInited() {
      setTimeout(() => {
        const exist = this.showList.find((item) => {
          return item.prop === this.active;
        });
        if (!exist) {
          if (this.showList[0]) {
            this.active = this.showList[0].prop;
          } else {
            this.checkInited();
          }
        }
      }, 1000);
    }
  }
};
</script>
<style scoped>
.avue-form__menu {
  display: none;
}
</style>
<style scoped>
.tabBox {
  background-color: #fff;
}
.tabBox .avue-form__menu {
  display: none;
}
</style>
