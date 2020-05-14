<template>
  <el-dialog
    :title="dialogTitle"
    :width="dialogWidth"
    :close-on-click-modal="false"
    :visible.sync="fieldDialogVisible"
    :before-close="closeDialog"
  >
    <avue-form ref="form" :option="dialogOption" v-model="form" class="new-field">
      <template v-if="form.quoteMethod === '1'" slot="ladderPriceJson">
        <div>
          <avue-form
            @submit="submitLadderForm"
            :option="ladderFormOption.option"
            v-model="ladderFormOption.form"
          ></avue-form>
          <avue-crud
            :data="ladderOption.data"
            :option="ladderOption.option"
            @row-del="delLadderUpdate"
          >
          </avue-crud>
        </div>
      </template>
      <template slot="suppliers">
        <avue-crud
          :data="form.suppliers"
          :option="supplierList.option"
          @row-save="handleSaveSupplier"
          @row-del="handleDeleteSupplier"
        >
          <template slot="menuLeft">
            <el-button type="primary" @click="handleShowSupplierSelect">添加</el-button>
          </template>
        </avue-crud>
      </template>
      <template slot="menuForm">
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="handleSubmit">保存</el-button>
      </template>
    </avue-form>
  </el-dialog>
</template>

<script>
import ladderFormOption from '@/const/rfq/newAndView/ladderForm';
import ladderOption from '@/const/rfq/newAndView/ladder';
import supplierList from '@/const/rfq/newAndView/supplierList';

// 采购方添加询价明细
export default {
  name: 'field-dialog',
  components: {},
  created: function() {},
  props: {
    dialogWidth: String,
    dialogTitle: String,
    dialogOption: Object,
    fieldDialogType: String,
    fieldDialogVisible: {
      type: Boolean,
      default: false
    },
    field: {
      type: Object,
      default: () => {
        return {
          elsAccount: '',
          fromBusiness: '',
          ladderPriceJson: [],
          suppliers: []
        };
      }
    }
  },
  data() {
    return {
      supplierList: supplierList,
      ladderOption: ladderOption,
      ladderFormOption: ladderFormOption,
      form: {
        ladderPriceJson: [],
        suppliers: []
      }
    };
  },
  watch: {
    field(newVal) {
      this.form = newVal;
      this.ladderOption.data = JSON.parse(newVal.ladderPriceJson) || [];
    },
    'form.taxCode'(newVal) {
      console.log(newVal);
      this.form.taxRate = newVal.split('_')[0];
    }
  },
  methods: {
    closeDialog() {
      this.$emit('close-field-dialog');
    },
    delLadderUpdate(row, index) {
      this.ladderOption.data.splice(index, 1);
      this.updateLadder();
    },
    handleDeleteSupplier(row, index) {
      this.form.suppliers.splice(index, 1);
    },
    handleSaveSupplier(row, done) {
      this.form.suppliers.push(row);
      done();
    },
    handleShowSupplierSelect() {
      this.$emit('show-supplier-select');
    },
    handleSubmit() {
      if (this.form.quoteMethod === '1') {
        if (this.ladderOption.data.length === 0) {
          this.$message.error('请添加阶梯数量');
          return;
        }
        this.form.ladderPriceJson = this.ladderOption.data;
      }
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.$emit('on-save-form', this.form);
        }
      });
    },
    submitLadderForm(form, done) {
      const length = this.ladderOption.data.length;
      if (
        this.ladderOption.data.length >= 1 &&
        Number.parseInt(form.ladderQuantity) <
          Number.parseInt(this.ladderOption.data[length - 1].ladderQuantity)
      ) {
        this.$message.error('阶梯数量必须大于上一阶梯数量');
        done();
        return;
      }
      this.ladderOption.data.push(form);
      this.updateLadder();
      this.ladderFormOption.form.ladderQuantity = '';
      done();
    },
    updateLadder() {
      const length = this.ladderOption.data.length;
      this.ladderOption.data = this.ladderOption.data.map((item, index) => {
        if (index === length - 1) {
          return {
            ...item,
            ladderGrade: `${item.ladderQuantity} <= x`
          };
        } else {
          return {
            ...item,
            ladderGrade: `${item.ladderQuantity} <= x < ${
              this.ladderOption.data[index + 1].ladderQuantity
            }`
          };
        }
      });
    }
  }
};
</script>
