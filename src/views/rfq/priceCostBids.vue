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
  created() {
    this.initDetail();
  },
  mounted() {},
  watch: {
    costPriceData(newValue) {
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
    initDetail() {},
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
        this.suppliers.forEach((supplier) => {
          const prop = supplier.toElsAccount;
          let price = 0;
          this.$getFormulaValue(
            this.$getFormulaItem('const-cailiao'), // tempProp
            this.providerData[tempProp].tableData
          ).forEach((item) => {
            if (item.price) price += Number(item.price);
          });
          i[prop] = price;
        });
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
        const columns = this.tabPermission[tempProp];
        if (columns.tableJson) {
          columns.tableJson.forEach((t) => {
            this.suppliers.forEach((supplier) => {
              const prop = supplier.toElsAccount;
              // let price = 0;
              // this.$getFormulaValue(
              //   this.$getFormulaItem('const-cailiao'), // tempProp
              //   this.providerData[tempProp].tableData
              // ).forEach((item) => {
              //   if (item.price) price += Number(item.price);
              // });
              // i[prop] = price;
              i[prop] = this.providerData[tempProp].tableData[0][t.prop];
            });
            console.log(item);
            this.sumDetailData.push({
              ...i,
              prop: tempProp,
              id: `${tempProp}_${t.prop}`,
              field: t.prop, // t.label
              key: item.label
            });
          });
        } else if (columns.fieldJson) {
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
