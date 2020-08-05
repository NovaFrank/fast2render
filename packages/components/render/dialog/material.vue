<template>
  <!-- 物料明细弹窗 -->
  <div class="materialBox">
    <el-input
      v-if="!multiple"
      v-model="seleted"
      size="small"
      :readonly="true"
      :disabled="isDisabled"
    >
      <el-button
        slot="append"
        icon="el-icon-search"
        :disabled="isDisabled"
        @click="openFieldDialog"
      />
    </el-input>
    <el-button
      v-else
      @click="openFieldDialog"
    >
      {{ addBtnText }}
    </el-button>
    <SelectDialogTable
      ref="materialsDialog"
      :dialog-visible.sync="materialDlgViaible"
      :title="'物料列表'"
      :column="materialsDialogOption.option.column"
      :data="materialsDialogOption.data"
      :page="materialsDialogOption.page"
      :query-param="materialsDialogQueryParam"
      :page-param="materialsDialogPageParam"
      :multiple="materialsDialogOption.option.multiple"
      @handleList="handleList"
      @ok="selectedMaterails"
    />
  </div>
</template>
<script>
import SelectDialogTable from '../selectDialog/selectDialogTablePage';
import materialsDialogOption from './const/materialsDialog';
import { getUserInfo } from '../../../lib/auth';
import { MaterialService } from '../../../lib/api/materials';

export default {
  name: 'SelectMaterial',
  components: {
    SelectDialogTable
  },
  props: {
    materialListOption: {
      type: Object,
      default: () => {
        return { obj: { materialNumber: '' } };
      }
    },
    listParams: {
      type: Object,
      default: () => {
        return {};
      }
    },
    api: {
      type: Function,
      default: MaterialService.list
    },
    seleted: { type: String, default: '' },
    addBtnText: { type: String, default: '添加物料' },

    isDisabled: { type: Boolean, default: false }, // 是否禁用
    multiple: { type: Boolean, default: false }
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
    handleList(queryCondition = {}, pagination) {
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
      // 外部传递参数
      for (const key in this.listParams) {
        if (this.listParams[key]) {
          params[key] = this.listParams[key];
        }
      }

      const api = this.api;
      api(params)
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
