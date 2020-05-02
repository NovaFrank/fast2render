<template>
  <div>
    <el-input v-model="dialogValue" :readonly="true">
      <i slot="suffix" class=" el-input_icon el-icon-search pointer" @click="dialogOpen"></i>
    </el-input>
    <SelectDialogTable
      ref="selectDialog"
      :dialogVisible.sync="dialogVisable"
      :title="title"
      :column="column"
      :multiple="multiple"
      :actionPath="actionPath"
      :requestMethod="requestMethod"
      @save="dialogSave"
    ></SelectDialogTable>
  </div>
</template>
<script>
import SelectDialogTable from './selectDialogTable';
export default {
  name: 'selectDialog',
  components: {
    SelectDialogTable
  },
  props: {
    value: { type: String, default: '' },
    title: { type: String, default: '' }, // dialog标题
    multiple: { type: Boolean, default: false }, // 是否多选
    actionPath: { type: String, default: null }, // 数据接口地址
    requestMethod: { type: String, default: 'GET' }, // 请求接口METHOD
    // 表格的列配置
    column: {
      type: Array,
      default: () => {
        return [];
      }
    }
  },

  data() {
    return { dialogVisable: false, dialogValue: '' };
  },
  watch: {
    value(newVal) {
      this.dialogValue = newVal;
    },
    dialogValue(newVal) {
      this.$emit('input', newVal);
    }
  },
  methods: {
    // 采购组选择框弹出
    dialogOpen() {
      this.dialogVisable = true;
    },
    dialogSave(selectColumn) {
      this.$emit('save', selectColumn);
    }
  }
};
</script>
<style scoped></style>
