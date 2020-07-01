<template>
  <div class="tabBox">
    <template v-if="newList && newList.length && tabView">
      <el-tabs v-model="active">
        <template v-for="subItem in newList">
          <el-tab-pane
            :label="subItem.label"
            v-if="newPermission && newPermission[subItem.prop]"
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
                      :addInCell="true"
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
        </template>
      </el-tabs>
    </template>
    <template v-if="newList && newList.length && !tabView">
      <template v-for="subItem in newList">
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
                    :addInCell="true"
                    :permission="newPermission[subItem.prop]"
                    :dataSource="subItem.prop"
                    v-on="$listeners"
                  ></fast2-component-render>
                </div>
              </template>
            </fast2-block-provider>
          </slot>
        </div>
      </template>
    </template>
  </div>
</template>
<script>
import { test } from '../demo/template.js';
// import { zhunru } from '../demo/template2.js';
import permisssion from '../demo/tableJson2';
export default {
  name: 'CostConfigTabRender',
  props: {
    list: {
      type: Array,
      default: () => {
        return [];
      }
    },
    debugger: {
      type: String,
      default: 'false'
    },
    readOnly: {
      type: Boolean,
      default: false
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
        if (this.newList[0] && !this.active) {
          this.active = this.newList[0].prop;
        }
        // this.$emit('design-update', this.editData);
      },
      deep: true,
      immediate: true
    },
    tabPermission: {
      handler(val) {
        this.newPermission = val;
        // this.$emit('design-update', this.editData);
      },
      deep: true,
      immediate: true
    }
  },
  computed: {
    tabData() {
      this.newList.map((item) => {
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
    if (this.debugger === 'true') {
      this.newList = test;
    }
    if (this.debugger === 'true') {
      this.newPermission = permisssion;
    }
    if (this.newList[0] && !this.active) {
      this.active = this.newList[0].prop;
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
