<template>
  <!-- 物料明细弹窗 -->
  <div class="materialBox">
    <el-input v-model="seleted" size="small" v-if="!multiple" :readonly="true">
      <el-button slot="append" icon="el-icon-search" @click="openFieldDialog"></el-button>
    </el-input>
    <el-button v-else @click="openFieldDialog">{{ addBtnText }}</el-button>
    <SelectDialogTable
      ref="materialsDialog"
      :dialogVisible.sync="materialDlgViaible"
      :title="'物料列表'"
      :column="materialsDialogOption.option.column"
      :data="materialsDialogOption.data"
      :page="materialsDialogOption.page"
      :queryParam="materialsDialogQueryParam"
      :pageParam="materialsDialogPageParam"
      :multiple="materialsDialogOption.option.multiple"
      @handleList="materialsHandleList"
      @ok="selectedMaterails"
    ></SelectDialogTable>
  </div>
</template>
<script>
import SelectDialogTable from '../selectDialog/selectDialogTablePage';
import materialsDialogOption from './const/materialsDialog';
import { getUserInfo } from '../../../lib/auth';
import { MaterialService } from '../../../lib/api/materials';

export default {
  name: 'SelectMaterial',
  props: {
    materialListOption: {
      type: Object,
      default: () => {
        return { obj: { materialNumber: '' } };
      }
    },
    seleted: { type: String, default: '' },
    multiple: { type: Boolean, default: false },
    addBtnText: { type: String, default: '添加物料' }
  },
  components: {
    SelectDialogTable
  },
  data() {
    return {
      materialDlgViaible: false,
      dialogTitle: '',
      dialogWidth: '60%',

      materialsDialogOption: materialsDialogOption,
      materialsDialogQueryParam: {},
      materialsDialogPageParam: { pageNo: 1, pageSize: 10 },
      fieldDialogForm: {
        materials: []
      }
    };
  },
  methods: {
    closeFieldDialog() {
      this.materialDlgViaible = false;
    },
    openFieldDialog(title = '添加', row = {}) {
      this.fieldDialogForm = title
        ? {
            elsAccount: getUserInfo().elsAccount,
            whetherDefault: 'Y',
            fromDesc: '',
            fromBusiness: '',
            materials: []
          }
        : {
            ...row,
            materials: []
          };

      this.dialogTitle = `${title}物料明细`;
      this.materialDlgViaible = true;
    },
    materialsHandleList(queryCondition = {}, pagination) {
      const params = {
        auditStatus: 0,
        elsAccount: getUserInfo().elsAccount,
        elsSubAccount: 1001,
        pageSize: pagination.pageSize,
        currentPage: pagination.currentPage,
        isFreeze: 'N',
        deleteIndicator: 'N'
      };

      for (const key in queryCondition) {
        if (queryCondition[key]) {
          params[key] = queryCondition[key];
        }
      }

      MaterialService.list(params)
        .then((res) => {
          if (
            res.data &&
            res.data.statusCode === '200' &&
            res.data.message === 'response OK' &&
            res.data.pageData
          ) {
            const pageData = res.data.pageData;
            this.materialsDialogOption.data = pageData.rows || [];
            this.materialsDialogOption.page.total = pageData.total;
          } else {
            console.log('list materials data fail', res.data);
            this.$message.error('查询采物料数据失败, ' + res.data.message || '');
          }
        })
        .catch((err) => {
          console.log('list materials data error', err);
          this.$message.error('查询物料数据失败, ' + err.message || '');
        });
    },
    selectedMaterails(materialList) {
      this.$emit('selectDone', materialList);
    }
  }
};
</script>
