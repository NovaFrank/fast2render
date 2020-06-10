<template>
  <div>
    <el-row>
      <el-radio-group class="date-check" v-model="bidChecked">
        <el-radio-button label="汇总比"></el-radio-button>
        <el-radio-button label="明细比"></el-radio-button>
      </el-radio-group>
    </el-row>
    <el-row v-if="bidChecked === '汇总比'">
      <el-col :span="4">
        <el-tabs @tab-click="handleClickMaterial" tab-position="left" style="height: 200px;">
          <el-tab-pane
            v-for="material in materialData"
            :label="material.materialName"
            :key="material.id"
          ></el-tab-pane>
        </el-tabs>
      </el-col>
      <el-col span="20">
        <avue-crud :option="costBidsSum.option" :data="sumData"></avue-crud>
      </el-col>
    </el-row>
    <el-row v-if="bidChecked === '明细比'">
      <el-col :span="4">
        <el-tabs tab-position="left" style="height: 200px;">
          <el-tab-pane
            v-for="material in materialData"
            :label="material.materialName"
            :key="material.id"
          ></el-tab-pane>
        </el-tabs>
      </el-col>
      <el-col span="20">
        <avue-crud
          :option="costBidsSumDetail.option"
          :data="sumDetailData"
          :span-method="spanMethod"
        ></avue-crud>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import costBidsSum from '@/const/rfq/costBidsSum';
import costBidsSumDetail from '@/const/rfq/costBidsSumDetail';
import { mySpanMethod } from '@/util/utils';

export default {
  name: 'cost-bids',
  components: {},
  props: {
    costPriceData: Array, // 成本报价 所有报价数据
    materialData: Array // 所有物料
  },
  data() {
    return {
      bidChecked: '汇总比',
      sumData: [],
      costBidsSum: costBidsSum,
      sumDetailData: [],
      costBidsSumDetail: costBidsSumDetail,
      currentMaterial: {},
      supplierColumn: [],
      suppliers: [],
      crudData: []
    };
  },
  created() {},
  mounted() {},
  watch: {
    costPriceData(newValue) {
      this.currentMaterial = this.costPriceData[0];
      const costJson = JSON.parse(newValue[0].costConstituteJson);
      this.template = costJson.templateJson;
      this.tabPermission = costJson.permissionJson;
      this.providerData = {};
      this.template.forEach((element) => {
        this.providerData[element.prop] = element.propData;
      });
      console.log(this.template, this.tabPermission, this.providerData);
      this.initColumn();
      this.initDetailColumn();
    }
  },
  methods: {
    // 初始循环当前供应商报价数据providerData
    initProviderData(supplier) {
      const prop = supplier.toElsAccount;
      const index = this.costPriceData.findIndex(
        (item) =>
          item.toElsAccount === prop && item.materialNumber === this.currentMaterial.materialNumber
      );
      const materialData = this.costPriceData[index];
      const costJson = JSON.parse(materialData.costConstituteJson);
      const template = costJson.templateJson;
      this.providerData = {};
      template.forEach((element) => {
        this.providerData[element.prop] = element.propData;
      });
      return prop;
    },
    // 初始汇总比
    initColumn() {
      // 获取最多供应商项
      let materialNumber = '';
      let supplierCount = 0;
      this.costPriceData.forEach((element) => {
        const currentMaterialSuppliers = this.costPriceData.filter(
          (item) => item.materialNumber === element.materialNumber
        ).length;
        if (currentMaterialSuppliers > supplierCount) {
          supplierCount = currentMaterialSuppliers;
          materialNumber = element.materialNumber;
        }
      });
      // 应有的供应商数量
      this.suppliers = this.costPriceData.filter((item) => item.materialNumber === materialNumber);
      // 应添加的供应商列
      this.supplierColumn = this.suppliers.map((item) => {
        return {
          label: item.toElsAccount,
          prop: item.toElsAccount
        };
      });
      this.costBidsSum.option.column = this.costBidsSum.option.column.concat(this.supplierColumn);

      this.template.forEach((item) => {
        let i = {};
        const tempProp = item.prop;
        if (
          this.providerData[tempProp].tableData &&
          this.providerData[tempProp].tableData.length > 0
        ) {
          this.suppliers.forEach((supplier) => {
            const prop = this.initProviderData(supplier);
            let price = 0;
            this.providerData[tempProp].tableData.forEach((t) => {
              const formula = this.$getFormulaItem(tempProp);
              price += this.$getFormulaValue(formula, t).price;
              console.log(tempProp, formula, price);
            });
            i[prop] = price;
          });
        } else if (this.providerData[tempProp].formData) {
          let price = 0;
          this.suppliers.forEach((supplier) => {
            const prop = this.initProviderData(supplier);
            const formula = this.$getFormulaItem(tempProp);
            price += this.$getFormulaValue(formula, this.providerData[tempProp].formData).price;
            i[prop] = price;
          });
        }
        this.sumData.push({
          ...i,
          key: item.label
        });
      });
    },
    // 初始明细比
    initDetailColumn() {
      // 获取最多供应商项
      let materialNumber = '';
      let supplierCount = 0;
      this.costPriceData.forEach((element) => {
        const currentMaterialSuppliers = this.costPriceData.filter(
          (item) => item.materialNumber === element.materialNumber
        ).length;
        if (currentMaterialSuppliers > supplierCount) {
          supplierCount = currentMaterialSuppliers;
          materialNumber = element.materialNumber;
        }
      });
      // 应有的供应商数量
      this.suppliers = this.costPriceData.filter((item) => item.materialNumber === materialNumber);
      // 应添加的供应商列
      this.supplierColumn = this.suppliers.map((item) => {
        return {
          label: item.toElsAccount,
          prop: item.toElsAccount
        };
      });
      this.costBidsSumDetail.option.column = this.costBidsSumDetail.option.column.concat(
        this.supplierColumn
      );
      this.template.forEach((item) => {
        let i = {};
        const tempProp = item.prop;
        if (
          this.providerData[tempProp].tableData &&
          this.providerData[tempProp].tableData.length > 0
        ) {
          this.suppliers.forEach((supplier) => {
            const prop = this.initProviderData(supplier);
            this.providerData[tempProp].tableData.forEach((t) => {
              const formula = this.$getFormulaItem(tempProp);
              i[prop] = this.$getFormulaValue(formula, t).price;
              this.sumDetailData.push({
                ...i,
                prop: tempProp,
                id: `${tempProp}_${t.$index}`,
                field: t.name, // t.label
                key: item.label
              });
            });
          });
        } else if (this.providerData[tempProp].formData) {
          this.suppliers.forEach((supplier) => {
            const prop = this.initProviderData(supplier);
            const formula = this.$getFormulaItem(tempProp);
            i[prop] = this.$getFormulaValue(formula, this.providerData[tempProp].formData).price;
          });
          this.sumDetailData.push({
            ...i,
            prop: tempProp,
            id: `${tempProp}`,
            field: this.providerData[tempProp].formData.type,
            key: item.label
          });
        }
      });
    },
    spanMethod({ row, column, rowIndex, columnIndex }) {
      return mySpanMethod(this.sumDetailData, [0], 'prop', 'id', columnIndex, row);
    },
    handleClickMaterial(value) {
      this.currentMaterial = this.costPriceData.filter(
        (item) => item.materialName === value.label
      )[0];
      this.handleTabHistoryTitle();
      this.historyChartData();
    }
  }
};
</script>
<style>
.date-check {
  margin-bottom: 24px;
}
</style>
