<template>
  <basic-container>
    <form-header
      titleText="预览"
      showButton
      :showHistoryButton="false"
      :buttons="headerButtons"
      @on-back="handleBack"
    ></form-header>
    <div class="material-price-tab">
      <el-tabs v-model="chartTabActive" @tab-click="handleTabChange">
        <el-tab-pane label="比价" name="bidChart">
          <avue-crud
            :data="inquiryListOption.data"
            :option="inquiryListOption.option"
            :span-method="spanMethod"
          >
            <template slot="menuLeft">
              <el-button
                v-if="detailObj.auditStatus !== '2'"
                size="small"
                type="primary"
                @click="handleSubmit"
                >提交</el-button
              >
            </template>
            <template
              v-for="(column, index) in supplierColumn"
              :slot="column.prop"
              slot-scope="{ row }"
              :v-key="`${row.materialNumber}_${column.prop}`"
            >
              <div :key="`${row.materialNumber}_${column.prop}`">
                <div v-if="row[column.prop] === `${row.materialNumber}_${column.prop}`">
                  <el-col :span="12">
                    <avue-radio
                      v-model="row[`itemStatus_${row.materialNumber}_${column.prop}`]"
                      :dic="dic"
                      @change="
                        (value) => handleRadioChange(value, row, row.materialNumber, column.prop)
                      "
                    ></avue-radio>
                  </el-col>
                  <el-col :span="12">
                    <el-input
                      :disabled="row[`itemStatus_${row.materialNumber}_${column.prop}`] === '5'"
                      v-model="row[`quota_${row.materialNumber}_${column.prop}`]"
                      placeholder="配额"
                      @input="
                        (value) => handleInputChange(value, row, row.materialNumber, column.prop)
                      "
                    ></el-input>
                  </el-col>
                </div>
                <span v-else>{{ row[column.prop] }}</span>
              </div>
            </template>
          </avue-crud>
        </el-tab-pane>
        <el-tab-pane label="成本比价" name="costChart">成本比价</el-tab-pane>
        <el-tab-pane label="历史价格" name="historyChart">
          <div>
            <div class="date-picker">
              <el-radio-group
                class="date-check"
                v-model="dateChecked"
                @change="handleDateCheckChange"
              >
                <el-radio-button label="年"></el-radio-button>
                <el-radio-button label="月"></el-radio-button>
              </el-radio-group>
              <el-date-picker
                v-bind:class="{ 'chart-action': dateChecked !== '年' }"
                v-model="yearValue"
                type="year"
                placeholder="选择年"
                value-format="yyyy"
                @change="handleYearChange"
              >
              </el-date-picker>
              <el-date-picker
                v-bind:class="{ 'chart-action': dateChecked !== '月' }"
                v-model="monthValue"
                type="month"
                value-format="yyyy-MM"
                @change="handleMonthChange"
              >
              </el-date-picker>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
      <el-row v-show="chartTabActive === 'historyChart'">
        <el-col :span="4">
          <el-tabs tab-position="left" style="height: 200px;">
            <el-tab-pane
              v-for="material in materialData"
              :label="material.materialName"
              :key="material.id"
            ></el-tab-pane>
          </el-tabs>
        </el-col>
        <el-col :span="20">
          <div id="bidChart" style="width: 75%; height: 600px;"></div>
        </el-col>
      </el-row>
    </div>
  </basic-container>
</template>

<script>
import priceObjOption from '@/const/rfq/priceBids/priceObj';
import historyChartOption from '@/const/rfq/priceBids/historyChart';
import inquiryListOption from '@/const/rfq/priceBids/detailInquiryList';
import { mySpanMethod } from '@/util/utils';
import { queryDetailAction, submitAudit } from '@/api/rfq';
import { historyAction } from '@/api/rfq/priceBids';
import { compare } from '@/util/utils.js';
import FormHeader from '@/components/views/formHeader';
import { formatDate } from '@/util/date';

let echarts = require('echarts/lib/echarts');
require('echarts/lib/component/title');
require('echarts/lib/component/tooltip');
require('echarts/lib/chart/bar');
require('echarts/lib/chart/line');

export default {
  components: { FormHeader },
  data() {
    return {
      quotaInput: '',
      dic: [
        {
          label: '接受', // 行信息 itemStatus
          value: '4'
        },
        {
          label: '拒绝',
          value: '5'
        }
      ],
      headerButtons: [{ power: true, text: '返回', type: '', size: '', action: 'on-back' }],
      materialRadio: '',
      currentMaterial: {},
      detailObj: {},
      priceObjOption: priceObjOption,
      inquiryListOption: inquiryListOption,
      historyChartOption: historyChartOption,
      priceObj: {
        no: 'RQ0170810001',
        inquiryTime: '2017-07-08 － 2017-08-20',
        center: 'HN－海宁',
        currency: 'RMB',
        strategy: '定向',
        dealPrice: '3600',
        dealTime: '2017-5-20',
        dealSupplier: '曼达数码'
      },
      chartTabActive: 'bidChart',
      chartDom: {},
      tabOption: {
        column: [
          {
            label: '比价',
            prop: 'bidChart'
          },
          {
            label: '成本比价',
            prop: 'costChart'
          },
          {
            label: '历史价格趋势',
            prop: 'historyChart'
          }
        ]
      },
      dateChecked: '年',
      yearValue: formatDate(new Date(), 'yyyy'),
      monthValue: formatDate(new Date(), 'yyyy-MM'),
      enquiryNumber: '',
      supplierColumn: [],
      suppliers: [],
      crudData: [],
      materialData: []
    };
  },
  created() {
    this.enquiryNumber = this.$route.params.enquiryNumber;
    this.initDetail();
    this.chartTabActive = this.$route.query.type || 'bidChart';
  },
  mounted() {
    this.initChart();
  },
  watch: {
    materialRadio(newVal) {
      this.initCurrentMaterial(newVal);
    }
  },
  methods: {
    handleRadioChange(value, row, materialNumber, toElsAccount) {
      const index = this.crudData.findIndex(
        (item) => item.materialNumber === materialNumber && item.toElsAccount === toElsAccount
      );
      this.crudData[index].itemStatus = value;
      const prop = `itemStatus_${materialNumber}_${toElsAccount}`;
      this.inquiryListOption.data[row.$index][prop] = value;
      if (value === '5') {
        this.inquiryListOption.data[row.$index][`quota_${materialNumber}_${toElsAccount}`] = '';
        this.crudData[index].quota = '';
      } else {
        this.crudData[index].$cellEdit = true;
      }
    },
    handleInputChange(value, row, materialNumber, toElsAccount) {
      const index = this.crudData.findIndex(
        (item) => item.materialNumber === materialNumber && item.toElsAccount === toElsAccount
      );
      this.crudData[index].quota = value;
      let sum = 0;
      this.crudData
        .filter((item) => item.materialNumber === materialNumber)
        .forEach((item) => {
          sum += Number(item.quota);
        });
      this.inquiryListOption.data[row.$index].count = sum;
    },
    getPriceIndex(row, column) {
      const quantity = row.quantity;
      const quantityList = JSON.parse(row.ladderPriceJson).map((item) => {
        return Number(item.ladderQuantity);
      });
      quantityList.push(quantity);
      const index = quantityList.findIndex((item) => item === Number(quantity));
      return JSON.parse(row.ladderPriceJson)[index - 1][column];
    },
    initDetailError(res) {
      if (res.data.statusCode !== '200') {
        this.$message.error(res.data.message);
        return false;
      }
      return true;
    },
    initColumnData() {
      // 根据物料编码排序
      this.inquiryListOption.data = this.inquiryListOption.data.sort(compare('materialNumber'));
      this.crudData = this.inquiryListOption.data;
      // 获取最多供应商项
      let materialNumber = '';
      let supplierCount = 0;
      this.inquiryListOption.data.forEach((element) => {
        const currentMaterialSuppliers = this.inquiryListOption.data.filter(
          (item) => item.materialNumber === element.materialNumber
        ).length;
        if (currentMaterialSuppliers > supplierCount) {
          supplierCount = currentMaterialSuppliers;
          materialNumber = element.materialNumber;
        }
      });
      // 应有的供应商数量
      this.suppliers = this.inquiryListOption.data.filter(
        (item) => item.materialNumber === materialNumber
      );
      // 应添加的供应商列
      this.supplierColumn = this.suppliers.map((item) => {
        return {
          slot: true,
          label: item.toElsAccount,
          prop: item.toElsAccount
        };
      });
      // 获取应有物料行
      this.materialData = [];
      this.inquiryListOption.data.forEach((item) => {
        if (
          this.materialData.filter((material) => material.materialNumber === item.materialNumber)
            .length === 0
        ) {
          this.materialData.push(item);
        }
      });
      // 最终数据
      let data = [];
      const options = ['含税价', '不含税价', '税率', '交货日期', '配额'];
      this.materialData.forEach((item) => {
        options.forEach((option) => {
          const d = {
            ...item,
            key: `${item.id}_${option}`,
            materialNumber: item.materialNumber,
            materialName: item.materialName,
            baseUnit: item.baseUnit,
            quantity: item.quantity,
            option: option
          };
          // 分配 对比项 数据
          this.suppliers.forEach((supplier) => {
            const prop = supplier.toElsAccount;
            const currentSupplierList = this.inquiryListOption.data.filter(
              (inquiry) =>
                inquiry.materialNumber === item.materialNumber && inquiry.toElsAccount === prop
            );
            if (currentSupplierList.length > 0) {
              const current = currentSupplierList[0];
              d[`quota_${item.materialNumber}_${current.toElsAccount}`] = '';
              if (option === '含税价') {
                d[prop] =
                  current.quoteMethod === '1'
                    ? this.getPriceIndex(current, 'priceIncludingTax')
                    : current.priceIncludingTax;
              } else if (option === '不含税价') {
                d[prop] =
                  current.quoteMethod === '1'
                    ? this.getPriceIndex(current, 'priceExcludingTax')
                    : current.priceExcludingTax;
              } else if (option === '税率') {
                if (currentSupplierList.length > 0) d[prop] = current.taxRate;
              } else if (option === '交货日期') {
                d[prop] = formatDate(new Date(current.deliveryDate), 'yyyy-MM-dd');
              } else if (option === '配额') {
                d[prop] = `${item.materialNumber}_${current.toElsAccount}`;
                d[`quota_${item.materialNumber}_${current.toElsAccount}`] = current.quota;
                d[`itemStatus_${item.materialNumber}_${current.toElsAccount}`] = current.itemStatus;
              }
            } else {
              d[prop] = '';
            }
          });
          data.push(d);
        });
      });
      this.inquiryListOption.data = data;
      this.inquiryListOption.data = this.inquiryListOption.data.map((item) => {
        let sum = 0;
        this.crudData
          .filter((crud) => item.materialNumber === crud.materialNumber)
          .forEach((item) => {
            sum += Number(item.quota);
            console.log('sum', sum);
          });
        if (item.option === '配额') {
          return {
            ...item,
            count: sum
          };
        }
        return item;
      });
    },
    initColumn() {
      this.inquiryListOption = inquiryListOption;
      // 添加供应商列
      if (this.inquiryListOption.option.column.length > 5) return;
      this.inquiryListOption.option.column = this.inquiryListOption.option.column.concat(
        this.supplierColumn
      );
      this.inquiryListOption.option.column.push({
        label: '合计',
        prop: 'count'
      });
    },
    initDetail() {
      this.detailObj = {};
      this.inquiryListOption.data = [];
      queryDetailAction('findHeadDetails', this.enquiryNumber).then((res) => {
        if (!this.initDetailError(res)) return;
        this.detailObj = res.data.data;
      });
      queryDetailAction('findItemDetails', this.enquiryNumber).then((res) => {
        if (!this.initDetailError(res)) return;
        this.inquiryListOption.data = res.data.pageData.rows.map((item) => {
          return {
            id: item.uuid,
            $cellEdit:
              item.itemStatus === '4' &&
              (this.detailObj.auditStatus !== '0' || this.detailObj.auditStatus === '2'),
            ...item
          };
        });
        // 初始化比价option
        this.initColumnData();
        this.initColumn();
        this.materialRadio = this.materialData[0].id;
        this.initCurrentMaterial(this.materialRadio);
      });
    },
    handleBack() {
      this.$router.back();
    },
    handleTabHistoryTitle() {
      this.historyChartOption.title.text = `${this.yearValue}年 ${this.currentMaterial.materialName} 物料比价 - 折线图`;
      this.chartDom.setOption(this.historyChartOption);
    },
    handleTabChange(tab, event) {
      this.chartTabActive = tab.name;
      if (this.chartTabActive === 'historyChart') {
        this.handleTabHistoryTitle();
        let newQuery = JSON.parse(JSON.stringify(this.$route.query)); // 深拷贝
        newQuery.type = 'historyChart';
        // 如果有引入 lodash, 可以写成: let newQuery = _.omit(this.$route.query, 'code')
        this.$router.replace({ query: newQuery });
        this.$router.go(0);
      }
    },
    handleSubmit() {
      let status = true;
      let result = false;
      this.crudData.forEach((item) => {
        if (item.itemStatus === '4') {
          status = false; // 必须有接受的报价才能够提交审批
        }
        if (item.itemStatus === '4') {
          let quote = 0;
          this.crudData
            .filter(
              (itemF) => itemF.materialNumber === item.materialNumber && item.itemStatus === '4'
            )
            .forEach((itemQuota) => {
              quote += Number(itemQuota.quota);
            });
          console.log('quote', quote);
          if (Number(quote) !== 100) result = true; // 相同物料 已报价 分配的配额必须相加为100
        }
      });
      if (status) {
        this.$message.error('已报价状态的单据不能提交审批');
        return;
      }
      if (result) {
        this.$message.error('物料配额必须等于100');
        return;
      }
      this.$confirm('是否提交审批？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const action = 'submit';
        const param = {
          enquiryNumber: this.currentEnquiryNumber,
          elsAccount: this.elsAccount,
          quoteEndTime: this.detailObj.quoteEndTime,
          enquiryType: this.detailObj.enquiryType,
          enquiryDesc: this.detailObj.enquiryDesc,
          companyCode: this.detailObj.companyCode,
          enquiryMethod: this.detailObj.enquiryMethod || '',
          itemList: this.crudData
        };
        let params = {
          elsAccount: this.detailObj.elsAccount,
          // toElsAccount: this.detailObj.toElsAccount,
          businessType: 'bargainEnquiryAudit',
          businessId: this.detailObj.enquiryNumber,
          params: JSON.stringify(param)
        };
        submitAudit(action, params).then((res) => {
          if (res.data.statusCode === '200') {
            this.$message.success('提交审批成功');
            return;
          }
          this.$message.error('提交审批失败');
        });
      });
    },
    handleDateCheckChange(value) {
      this.dateChecked = value;
      if (value === '年') {
        this.historyChartData(this.yearValue);
      } else {
        this.historyChartData(this.monthValue);
      }
    },
    handleMonthChange(value) {
      this.historyChartData(value);
    },
    handleYearChange(value) {
      this.historyChartData(value);
    },
    historyChartData(dateStr) {
      const params = {
        elsAccount: this.detailObj.elsAccount,
        dateStr: dateStr || this.yearValue,
        materialNumber: this.currentMaterial.materialNumber // 'A2020052200014'
      };
      historyAction('findPageListHisPriceY', params).then((res) => {
        if (res.data.statusCode === '200') {
          const data = res.data.data;
          this.historyChartOption.xAxis.data =
            data.length > 0 ? data.map((item) => item.dateStr) : [];
          this.historyChartOption.series[0].data =
            data.length > 0 ? data.map((item) => item.price) : [];
          this.initChart();
        }
      });
    },
    initChart() {
      this.chartDom = echarts.init(document.getElementById('bidChart'));
      this.chartDom.setOption(this.historyChartOption);
    },
    initCurrentMaterial(value) {
      this.handleTabHistoryTitle();
      this.currentMaterial = this.materialData.filter((item) => item.id === value)[0];
      this.historyChartData();
    },
    spanMethod({ row, column, rowIndex, columnIndex }) {
      return mySpanMethod(
        this.inquiryListOption.data,
        [1, 2, 3, 4],
        'materialNumber',
        'key',
        columnIndex,
        row
      );
    }
  }
};
</script>

<style>
.material-list {
  border: 1px solid gray;
  padding: 24px;
}
.material-radio {
  display: block;
  margin-bottom: 12px;
}
.material-price {
  padding: 24px;
}
.avue-detail {
  padding-top: 0px;
}
.price-bottom .avue-detail__label,
.price-bottom .avue-detail__content {
  color: dodgerblue !important;
}
.material-price-tab {
  padding: 0 24px;
}
.chart-action {
  display: none !important;
}
.date-picker {
  top: 0;
  z-index: 9999;
  margin-bottom: 24px;
}
.date-check {
  margin-right: 24px;
}
</style>
