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
                v-if="
                  detailObj.auditStatus &&
                    detailObj.auditStatus !== '2' &&
                    detailObj.auditStatus !== '0'
                "
                size="small"
                @click="handleSave"
              >
                保存
              </el-button>
              <el-button
                v-if="
                  detailObj.auditStatus &&
                    detailObj.auditStatus !== '2' &&
                    detailObj.auditStatus !== '0'
                "
                size="small"
                type="primary"
                @click="handleSubmit"
                >保存</el-button
              >
            </template>
            <template
              v-for="(column, index) in supplierColumn"
              :slot="column.prop"
              slot-scope="{ row }"
              :v-key="`${row.materialNumber}_${column.prop}`"
            >
              <div :key="`${row.materialNumber}_${column.prop}`">
                <div
                  v-if="
                    row[column.prop] === `${row.materialNumber}_${column.prop}` &&
                      row[`itemStatus_${row.materialNumber}_${column.prop}`] !== '1' &&
                      row[`itemStatus_${row.materialNumber}_${column.prop}`] !== '3'
                  "
                >
                  <el-col :span="12">
                    <avue-radio
                      :disabled="detailObj.auditStatus === '2' || detailObj.auditStatus === '0'"
                      v-model="row[`itemStatus_${row.materialNumber}_${column.prop}`]"
                      :dic="dic"
                      @change="
                        (value) => handleRadioChange(value, row, row.materialNumber, column.prop)
                      "
                    ></avue-radio>
                  </el-col>
                  <el-col :span="12">
                    <el-input
                      v-show="
                        row[`itemStatus_${row.materialNumber}_${column.prop}`] === '4' &&
                          templateRule.enquiryIsQuota === true
                      "
                      :disabled="
                        row[`itemStatus_${row.materialNumber}_${column.prop}`] === '5' ||
                          detailObj.auditStatus === '2' ||
                          detailObj.auditStatus === '0'
                      "
                      v-model="row[`quota_${row.materialNumber}_${column.prop}`]"
                      placeholder="配额"
                      @input="
                        (value) => handleInputChange(value, row, row.materialNumber, column.prop)
                      "
                    ></el-input>
                  </el-col>
                </div>
                <span v-else-if="row[column.prop] !== `${row.materialNumber}_${column.prop}`">
                  {{ row[column.prop] }}
                </span>
              </div>
            </template>
          </avue-crud>
        </el-tab-pane>
        <el-tab-pane label="成本比价" name="costChart">
          <cost-bids :materialData="costMaterialData" :costPriceData="costPriceData"></cost-bids>
        </el-tab-pane>
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
          <el-tabs @tab-click="handleClickYMaterial" tab-position="left" style="height: 200px;">
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
import { queryDetailAction, purchaseEnquiryAction } from '@/api/rfq';
import { historyAction } from '@/api/rfq/priceBids';
import { compare, getUserInfo } from '@/util/utils.js';
import FormHeader from '@/components/views/formHeader';
import { formatDate } from '@/util/date';
import costBids from './priceCostBids';
import { validatenull } from '@/util/validate';
import { ElsTemplateConfigService } from '@/api/templateConfig.js';

let echarts = require('echarts/lib/echarts');
const execMathExpress = require('exec-mathexpress');
require('echarts/lib/component/title');
require('echarts/lib/component/tooltip');
require('echarts/lib/chart/bar');
require('echarts/lib/chart/line');

export default {
  components: { FormHeader, costBids },
  data() {
    return {
      templateRule: {
        // enquirySetRanking: true, 是否开启排名 - 在比价页面对比项中添加【排名】字段
        // enquiryIsQuota: true, 是否配额 是否现实配额列（是否判断）
        // enquiryQuotaType: 'percentage', 配额方式 百分比percentage/数量number
        // enquiryIsProjectApproval: true, 是否立项 发布前需要提交审批，审批通过 则可发布
        // enquiryPurchaserTax: true, 采购方税率/供方税率
        // isMin3Supplier: true, 最小三家供应商
        // enquiryPriceContrast: 'package', 比价 1打包比-package 2逐条比-item 3成本比-cost ： 成本比是否需要将成本含税价等传接口？
        // ============================================================================
        // enquiryIsOnlyQualifiedSupplier: true, 是否供应商资质审查 - 暂无
        // enquiryWay: 'partner', 询价方式（合作伙伴、企企通、已认证、潜在、陌生） - 暂无
        // ----------------------------------------------------------------------------
        // isViewAbleAttachmentBefroeDealline: true 报价时间截止前，是否可查看供方附件
        // ------------------- 不要 enquiryPriceQuote: 'normal', 报价方式
        // ------------------- 不要 enquirySetPassword: true, 是否使用开启密码 是否与头部开启冲突？
        // 公开原则 enquiryPublicRule 未知
        // enquiryViewHistory: 'ranking', 查看历史记录 price/ranking/supplier 仅历史记录列表加入供应商名
        // 询价范围？？？？？enquiryScope？？？？？？成本报价 true/false？？？？？ 合并到询价方式
      },
      costPriceData: [],
      costMaterialData: [],
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
    const userInfo = getUserInfo();
    this.elsAccount = userInfo.elsAccount;
    this.elsSubAccount = userInfo.elsSubAccount;
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
    handleClickYMaterial(value) {
      this.currentMaterial = this.materialData.filter(
        (item) => item.materialName === value.label
      )[0];
      this.handleTabHistoryTitle();
      this.historyChartData();
    },
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
      if (validatenull(row.ladderPriceJson)) return;
      const quantity = row.quantity;
      const quantityList = JSON.parse(row.ladderPriceJson).map((item) => {
        return Number(item.ladderQuantity);
      });
      quantityList.push(quantity);
      const index = quantityList.findIndex((item) => item === Number(quantity));
      return JSON.parse(row.ladderPriceJson)[index - 1][column];
    },
    getCostPriceIndex(row, column) {
      if (row.itemStatus === '1' || row.itemStatus === '3') {
        return '**';
      }
      const costJson = JSON.parse(row.costConstituteJson);
      if (costJson) {
        const template = costJson.templateJson;
        let price = 0;
        template.forEach((item) => {
          if (item.propData && item.propData.tableData && item.propData.tableData.length > 0) {
            item.propData.tableData.forEach((t) => {
              const formula = this.$getFormulaItem(item.prop);
              price += Number(this.$getFormulaValue(formula, t).price);
            });
          } else if (item.propData && item.propData.formData) {
            const formula = this.$getFormulaItem(item.prop);
            price += Number(this.$getFormulaValue(formula, item.propData.formData).price);
          }
        });
        if (column === 'priceExcludingTax') {
          const result = execMathExpress('v1 / ( v2 + v3 )', {
            v1: price || 0,
            v2: 1,
            v3: row.taxRate
          });
          price = Math.floor((result.num / result.den) * 100) / 100;
        }
        return price || '';
      }
      return '';
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
          width: '150',
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
      this.costMaterialData = this.materialData.filter((item) => item.quoteMethod === '2');
      // 最终数据
      let data = [];
      let options = ['含税价', '不含税价', '税率', '交货日期', '配额'];
      if (this.templateRule.enquirySetRanking === true) options.splice(4, 0, '排名');
      this.materialData.forEach((item) => {
        options.forEach((option) => {
          const d = {
            ...item,
            key: `${item.id}_${option}`,
            materialNumber: item.materialNumber,
            materialName: item.materialName,
            baseUnit: item.baseUnit,
            quantity: item.quantity,
            option: this.templateRule.enquiryIsQuota !== true && option === '配额' ? '' : option
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
                    : current.quoteMethod === '2'
                    ? this.getCostPriceIndex(current, 'priceIncludingTax')
                    : current.priceIncludingTax;
              } else if (option === '不含税价') {
                d[prop] =
                  current.quoteMethod === '1'
                    ? this.getPriceIndex(current, 'priceExcludingTax')
                    : current.quoteMethod === '2'
                    ? this.getCostPriceIndex(current, 'priceExcludingTax')
                    : current.priceExcludingTax;
              } else if (option === '税率') {
                if (currentSupplierList.length > 0) d[prop] = current.taxRate;
              } else if (option === '交货日期') {
                d[prop] = current.deliveryDate
                  ? formatDate(new Date(current.deliveryDate), 'yyyy-MM-dd')
                  : '';
              } else if (option === '排名') {
                d[prop] = current.rank;
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
      this.inquiryListOption.option.column = [
        { label: '物料编号', prop: 'materialNumber' },
        { label: '物料名称', prop: 'materialName' },
        { label: '单位', prop: 'baseUnit' },
        { label: '需求数量', prop: 'quantity' },
        { label: '对比项', prop: 'option' }
      ];
      this.inquiryListOption.option.column = this.inquiryListOption.option.column.concat(
        this.supplierColumn
      );
      this.inquiryListOption.option.column.push({
        label: '合计',
        prop: 'count'
      });
    },
    async initDetail() {
      const res = await ElsTemplateConfigService.find({
        elsAccount: this.elsAccount,
        businessModule: 'enquiry',
        currentVersionFlag: 'Y'
      });
      const configurations = [];

      if (res.data && res.data.statusCode === '200' && res.data.pageData) {
        const rows = res.data.pageData.rows || [];
        for (const item of rows) {
          const json = JSON.parse(item.configJson);
          configurations[item.templateNumber] = {
            name: item.templateName, // 模板名称
            rule: json.rule // 单规则
          };
        }
        this.configurations = configurations;
      } else {
        this.requestTypeDict = [];
        this.$message.error('查找采购申请配置数据失败, ' + res.data.message || '');
      }
      this.detailObj = {};
      this.inquiryListOption.data = [];
      queryDetailAction('findHeadDetails', this.enquiryNumber).then((res) => {
        if (!this.initDetailError(res)) return;
        this.detailObj = res.data.data;
        this.templateRule = this.configurations[this.detailObj.enquiryType]
          ? this.configurations[this.detailObj.enquiryType].rule
          : {};
      });
      queryDetailAction('findItemDetails', this.enquiryNumber).then((res) => {
        if (!this.initDetailError(res)) return;
        this.costPriceData = res.data.pageData.rows.filter((item) => item.quoteMethod === '2');
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
    handleSave() {
      const param = {
        ...this.detailObj,
        elsAccount: this.elsAccount,
        itemList: this.crudData
      };
      purchaseEnquiryAction('acceptOrRefuse', param).then((res) => {
        if (res.data.statusCode === '200') {
          this.$message.success('保存成功');
        } else {
          this.$message.error(res.data.message);
        }
      });
    },
    handleSubmit() {
      // 保存
      this.$router.push({ path: `/priceAuditReport/${this.detailObj.enquiryNumber}` });
      // let status = true;
      // let result = false;
      // this.crudData.forEach((item) => {
      //   if (item.itemStatus === '4') {
      //     // 必须有接受的报价才能够提交审批
      //     status = false;
      //   }
      //   if (item.itemStatus === '4') {
      //     let quote = 0;
      //     this.crudData
      //       .filter(
      //         (itemF) => itemF.materialNumber === item.materialNumber && item.itemStatus === '4'
      //       )
      //       .forEach((itemQuota) => {
      //         quote += Number(itemQuota.quota);
      //       });
      //     // 相同物料 已报价 分配的配额必须相加为100（且 规则为配额是）
      //     if (
      //       Number(quote) !== 100 &&
      //       this.templateRule.enquiryIsQuota === true &&
      //       this.templateRule.enquiryQuotaType !== 'number'
      //     ) {
      //       result = true;
      //     } else if (
      //       Number(quote) !== Number(item.quantity) &&
      //       this.templateRule.enquiryIsQuota === true &&
      //       this.templateRule.enquiryQuotaType === 'number'
      //     ) {
      //       result = true;
      //     }
      //   }
      // });
      // if (status) {
      //   this.$message.error('必须有接受状态的报价才能够提交审批,保存后再提交');
      //   return;
      // }
      // if (result) {
      //   this.$message.error(
      //     `物料配额必须等于${this.templateRule.enquiryQuotaType !== 'number' ? '100' : '需求数量'}`
      //   );
      //   return;
      // }
      // this.$confirm('是否提交审批？', '提示', {
      //   confirmButtonText: '确定',
      //   cancelButtonText: '取消',
      //   type: 'warning'
      // }).then(() => {
      //   const action = 'submit';
      //   const param = {
      //     enquiryNumber: this.currentEnquiryNumber,
      //     elsAccount: this.elsAccount,
      //     quoteEndTime: this.detailObj.quoteEndTime,
      //     enquiryType: this.detailObj.enquiryType,
      //     enquiryDesc: this.detailObj.enquiryDesc,
      //     companyCode: this.detailObj.companyCode,
      //     enquiryMethod: this.detailObj.enquiryMethod || '',
      //     itemList: this.crudData
      //   };
      //   let params = {
      //     elsAccount: this.detailObj.elsAccount,
      //     // toElsAccount: this.detailObj.toElsAccount,
      //     businessType: 'bargainEnquiryAudit',
      //     businessId: this.detailObj.enquiryNumber,
      //     params: JSON.stringify(param)
      //   };
      //   submitAudit(action, params).then((res) => {
      //     if (res.data.statusCode === '200') {
      //       this.$message.success('提交审批成功');
      //       this.$router.back();
      //       return;
      //     }
      //     this.$message.error('提交审批失败');
      //   });
      // });
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
