<template>
  <div>
    <el-dialog
      title="报价记录"
      width="70%"
      :visible.sync="dialogVisible"
      :before-close="closeDialog"
    >
      <avue-crud :data.sync="crudData" :option="crudOption.option">
        <!-- 含税 -->
        <template slot-scope="scope" slot="priceIncludingTax">
          <span v-if="scope.row.quoteMethod === '0'">
            {{
              (scope.row.itemStatus === '2' || scope.row.itemStatus === '4') &&
              detailObj.quoteEndTime > new Date().getTime()
                ? '**'
                : scope.row.priceIncludingTax
            }}
          </span>
          <span v-else-if="scope.row.quoteMethod === '1'">
            <span>{{ getPriceIndex(scope.row, 'priceIncludingTax') }}</span>
          </span>
          <span v-else-if="scope.row.quoteMethod === '2'">
            {{ getCostPriceIndex(scope.row, 'priceIncludingTax') }}
          </span>
        </template>
        <!-- 不含税 -->
        <template slot-scope="scope" slot="priceExcludingTax">
          <span v-if="scope.row.quoteMethod === '0'">
            {{
              (scope.row.itemStatus === '2' || scope.row.itemStatus === '4') &&
              detailObj.quoteEndTime > new Date().getTime()
                ? '**'
                : scope.row.priceExcludingTax
            }}
          </span>
          <span v-else-if="scope.row.quoteMethod === '1'">
            {{ getPriceIndex(scope.row, 'priceExcludingTax') }}
          </span>
          <span v-else-if="scope.row.quoteMethod === '2'">
            {{ getCostPriceIndex(scope.row, 'priceExcludingTax') }}
          </span>
        </template>
      </avue-crud>
    </el-dialog>
  </div>
</template>
<script>
import historyOption from '@/const/rfq/newAndView/history';
import { validatenull } from '@/util/validate';

const execMathExpress = require('exec-mathexpress');

export default {
  name: 'history',
  props: {
    detailObj: Object,
    title: { type: String, default: '' }, // dialog标题
    dialogVisible: { type: Boolean, default: false }, // dialog显隐
    // 表格的列配置
    // 表格的数据
    data: {
      type: Array,
      default: () => {
        return [];
      }
    },
    // 表格的分页配置
    page: {
      type: Object,
      default: () => {
        return { total: 0, currentPage: 1, pageSize: 10 };
      }
    },
    // 表格的查询参数（点击搜索时，更新当前参数）
    queryParam: {
      type: Object,
      default: () => {
        return {};
      }
    },
    // 表格的分页参数(点击搜索，切换分页，切换每页展示条数时，更新当前参数)
    pageParam: {
      type: Object,
      default: () => {
        return { pageNo: 1, pageSize: 10 };
      }
    },
    // 是否多选
    multiple: {
      type: Boolean,
      default: false
    },
    quoteMethodData: {
      type: Array,
      default: () => {
        return [];
      }
    }
  },
  data() {
    return {
      selectColumns: [],
      crudObj: {},
      crudData: [],
      crudOption: historyOption,
      crudPage: {
        total: 0, // 总页数
        currentPage: 1, // 当前页数
        pageSize: 10 // 每页显示多少条
      },
      crudQueryParam: {},
      crudPageParam: {},
      crudMultiple: true
    };
  },
  created() {
    this.crudData = this.data;
    this.$emit('handleList');
  },
  watch: {
    quoteMethodData: function(newValue) {
      this.crudOption.option.column = this.crudOption.option.column.map((item) => {
        if (item.prop === 'quoteMethod') {
          return {
            ...item,
            dicData: newValue
          };
        }
        return item;
      });
    },
    data: function(newValue) {
      this.crudData = newValue;
    },
    page: function(newValue) {
      this.crudPage = newValue;
    },
    column: function(newValue) {
      this.crudOption.column = newValue;
    },
    crudOption: function(newValue) {}
  },
  methods: {
    closeDialog() {
      this.$emit('close-field-dialog');
    },
    getPriceIndex(row, column) {
      if (validatenull(row.ladderPriceJson)) return;
      if (
        (row.itemStatus === '2' || row.itemStatus === '4') &&
        this.detailObj.quoteEndTime > new Date().getTime()
      ) {
        return '**';
      }
      const quantity = row.quantity;
      const quantityList = JSON.parse(row.ladderPriceJson).map((item) => {
        return Number(item.ladderQuantity);
      });
      quantityList.push(quantity);
      const index = quantityList.findIndex((item) => item === Number(quantity));
      return JSON.parse(row.ladderPriceJson)[index - 1][column];
    },
    getCostPriceIndex(row, column) {
      if (
        (row.itemStatus === '2' || row.itemStatus === '4') &&
        this.detailObj.quoteEndTime > new Date().getTime()
      ) {
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
    }
  }
};
</script>
