<template>
  <div class="page-container">
    <div ref="widgetPage" size="small">
      <el-row :gutter="option.gutter">
        <template v-for="(column, index) in option.column">
          <el-col
            class="widget-card"
            v-if="column.type == 'dynamic'"
            :key="index"
            :md="column.span || 12"
            :xs="24"
          >
            <render-card :data="data" :column="column" :index="index"></render-card>
          </el-col>
          <el-col
            class="widget-group"
            v-else-if="column.type == 'group'"
            :key="index"
            :md="column.span || 12"
            :xs="24"
          >
            <render-group :data="data" :column="column" :index="index"> </render-group>
          </el-col>
          <el-col
            class="widget-tab"
            v-else-if="column.type == 'block-tabs' && mode === 'setting'"
            :key="index"
            :md="column.span || 12"
            :xs="24"
          >
            <render-config-tab :providerData="data" :template="template" :index="index">
            </render-config-tab>
          </el-col>
          <el-col
            class="widget-tab"
            v-else-if="column.type == 'block-tabs'"
            :key="index"
            :md="column.span || 12"
            :xs="24"
          >
            <render-tab :data="data" :template="column.data" :index="index"> </render-tab>
          </el-col>
          <el-col v-else :key="index" :md="column.span || 12" class="widget-item" :xs="24">
            <render-item
              :item="column"
              :providerData="data"
              :label="column.label"
              :prop="column.prop"
              v-bind="$attrs"
            >
            </render-item>
          </el-col>
        </template>
      </el-row>
    </div>
  </div>
</template>

<script>
import RenderItem from './render-item';
import RenderCard from './render-card';
import RenderGroup from './render-group';
import RenderTab from './render-tab';
import RenderConfigTab from './render-config-tab';

export default {
  name: 'Render',
  components: {
    RenderItem,
    RenderCard,
    RenderGroup,
    RenderTab,
    RenderConfigTab
  },
  props: ['option', 'data', 'mode', 'config'],
  data() {
    return {
      selectWidget: this.select,
      fullData: {},
      templateConfig: this.config || {},
      template: {}
    };
  },
  mounted() {
    this.$root.$on('change-form', this.updateProviderData);
    this.$root.$on('change-table', this.updateProviderTableData);
    this.$root.$on('update-template-config', this.updateTemplate);
  },
  unmounted() {
    this.$root.$off('change-form', this.updateProviderData);
    this.$root.$off('change-table', this.updateProviderTableData);
    this.$root.$off('update-template-config', this.updateTemplate);
  },
  methods: {
    updateProviderData(data) {
      this.fullData = {
        ...this.fullData,
        ...data
      };
    },
    updateProviderTableData(data) {
      this.fullData = {
        ...this.fullData,
        ...data
      };
    },
    updateTemplate(config) {
      this.option.column.map((item) => {
        if (item.type === 'block-tabs') {
          item.data = config.template;
        }
      });
      this.template = this.option;
      this.templateConfig = config.templateConfig;
    },
    getConfig() {
      return this.templateConfig;
    }
  }
};
</script>
