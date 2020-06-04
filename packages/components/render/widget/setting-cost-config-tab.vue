<template>
  <div class="tabBox">
    <el-button @click="dialogVisible = true">选择模块 </el-button>
    <!-- 模块选择 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" append-to-body>
      <div>
        <el-checkbox-group v-model="templateConfig.tab" @change="changeShowList(item)">
          <template v-for="item in list">
            <el-checkbox
              :key="item.prop"
              :name="item.prop"
              :label="item.label"
              :checked="templateConfig.tab.includes(item.label)"
            >
            </el-checkbox>
          </template>
        </el-checkbox-group>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button>取 消</el-button>
        <el-button type="primary" @click="handleTemplateBlock">确定模块</el-button>
      </span>
    </el-dialog>
    <template v-if="showlist && showlist.length">
      <el-tabs v-model="active" @tab-click="changeTab">
        <template v-for="subTabItem in showlist">
          <el-tab-pane
            v-if="!subTabItem.hide"
            :label="subTabItem.label"
            :name="subTabItem.prop"
            :key="subTabItem.prop"
            ><slot :name="subTabItem.prop">
              <fast2-block-provider :option="subTabItem.option" :version="subTabItem.version">
                <template v-slot="component">
                  <div>
                    {{ component.list }}
                    <template v-for="item in component.list">
                      <div :key="item.id" v-if="item.data && item.data.column">
                        <el-checkbox-group v-model="templateConfig.column[subTabItem.prop]">
                          <template v-for="subFielditem in item.data.column">
                            <span :key="subFielditem.prop">
                              <el-checkbox
                                :name="subFielditem.prop"
                                :label="subFielditem.label"
                                :checked="
                                  templateConfig.column[subTabItem.prop].includes(
                                    subFielditem.label
                                  )
                                "
                                @change="changeShowColumList(item.data.column, subTabItem.prop)"
                                >{{ subFielditem.label }}
                              </el-checkbox></span
                            >
                          </template>
                        </el-checkbox-group>
                      </div>
                    </template>
                  </div></template
                ></fast2-block-provider
              ></slot
            >
          </el-tab-pane></template
        ></el-tabs
      >
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

export default {
  name: 'CostConfigTabSetting',
  props: {
    list: {
      type: Array,
      default: () => {
        return [];
      }
    },
    config: {},
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
      templateConfig: {
        tab: [],
        column: {}
      },
      template: {},
      dialogVisible: false,
      dialogTitle: '选择启用模块',
      dialogWidth: 550,
      showlist: [],
      active: ''
    };
  },
  computed: {
    tabData() {
      this.list.map((item) => {
        if (!this.providerData[item.prop]) {
          this.providerData[item.prop] = {
            tableData: []
          };
        }
      });
      return this.providerData;
    }
  },
  mounted() {
    console.log('启动tab组件');
    this.active = this.list[0].prop;
    this.initCheckColumnList();
  },
  methods: {
    changeShowList() {
      // debugger;
    },
    updateTemplateConfig() {
      this.$root.$emit('update-template-config', {
        template: this.template,
        config: this.templateConfig
      });
    },
    changeShowColumList(column, prop) {
      if (!column || !column.length) {
        return false;
      }
      let newColumn = [];
      column.map((item) => {
        let list = this.templateConfig.column[prop];
        let isShow = list && item.label && list.includes(item.label);
        delete item.hide;
        if (isShow) {
          newColumn.push(item);
        }
      });

      this.template = this.template.map((item) => {
        if (item.prop === prop) {
          item.option = item.option || {};
          item.option.column = newColumn;
        }
        return item;
      });
      this.showlist = this.template;
      this.updateTemplateConfig();
    },
    initCheckColumnList() {
      this.list.map((item) => {
        this.templateConfig.column[item.prop] = [];
      });
    },
    handleTemplateBlock() {
      this.showlist = [];
      this.list.map((item) => {
        let list = this.templateConfig.tab;
        let isShow = list && item.label && list.includes(item.label);
        item.option = { column: [] };
        if (isShow) {
          this.showlist.push(item);
        }
      });
      this.template = this.showlist;
      this.updateTemplateConfig();
      this.dialogVisible = false;
    }
  }
};
</script>
<style scoped>
.tabBox {
  background-color: #fff;
}
</style>
