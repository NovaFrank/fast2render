<template>
  <el-row :gutter="24">
    <el-col :span="4">
      <div class="material-list">
        <p>物料</p>
        <el-radio
          class="material-radio"
          style="display: block"
          v-for="material in materialList"
          v-model="materialRadio"
          :key="material.id"
          :label="material.id"
        >
          {{ material.name }}
        </el-radio>
      </div>
    </el-col>
    <el-col :span="20">
      <div class="material-price">
        <el-row :gutter="20">
          <el-col :span="18">
            <div>
              <!-- 数据展示 -->
              <avue-detail :option="priceObjOption.option" v-model="priceObj"></avue-detail>
              <avue-detail
                :option="priceObjOption.optionBottom"
                class="price-bottom"
                v-model="priceObj"
              ></avue-detail>
            </div>
          </el-col>
          <el-col :span="6">
            <div>
              <el-button type="primary">
                接受
              </el-button>
              <el-button>
                重报价
              </el-button>
            </div>
          </el-col>
        </el-row>
      </div>
      <div class="material-price-tab">
        <avue-tabs
          v-model="chartTabActive"
          @change="handelChartChange"
          :option="tabOption"
        ></avue-tabs>
        <div>
          <div v-if="chartTabActive === 'historyChart'" class="date-picker">
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
              v-model="monthRange"
              type="monthrange"
              range-separator="至"
              start-placeholder="开始月份"
              end-placeholder="结束月份"
              value-format="yyyy-MM"
              @change="handleMonthRangeChange"
            >
            </el-date-picker>
            <el-radio-group
              class="date-check"
              v-model="dateChecked"
              @change="handleDateCheckChange"
            >
              <el-radio-button label="年"></el-radio-button>
              <el-radio-button label="月"></el-radio-button>
            </el-radio-group>
          </div>
          <div id="bidChart" style="width: 75%; height: 600px;"></div>
        </div>
      </div>
    </el-col>
  </el-row>
</template>

<script>
import priceObjOption from '@/const/rfq/priceBids/priceObj';
import bidChartOption from '@/const/rfq/priceBids/bidChart';
import historyChartOption from '@/const/rfq/priceBids/historyChart';
let echarts = require('echarts/lib/echarts');
require('echarts/lib/component/title');
require('echarts/lib/component/tooltip');
require('echarts/lib/chart/bar');
require('echarts/lib/chart/line');

export default {
  components: {},
  data() {
    return {
      materialList: [
        {
          name: '小米手机壳',
          id: 'xiaomi'
        },
        {
          name: '华为手机壳',
          id: 'huawei'
        },
        {
          name: '鼠标垫',
          id: 'mouse'
        }
      ],
      materialRadio: 'mouse',
      currentMaterial: {},
      priceObjOption: priceObjOption,
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
      yearValue: '',
      monthRange: ''
    };
  },
  created() {
    this.initCurrentMaterial(this.materialRadio);
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
    handelChartChange(value) {
      this.chartTabActive = value.prop;
      if (this.chartTabActive === 'bidChart') {
        this.chartDom.setOption(bidChartOption);
      } else if (this.chartTabActive === 'costChart') {
        this.chartDom.setOption(historyChartOption);
      } else if (this.chartTabActive === 'historyChart') {
        historyChartOption.title.text = `2019年 ${this.currentMaterial.name} 物料比价 - 折线图`;
        this.chartDom.setOption(historyChartOption);
      }
    },
    handleDateCheckChange(value) {
      this.dateChecked = value;
    },
    handleMonthRangeChange(value) {
      console.log(value);
    },
    handleYearChange(value) {
      console.log(value[0], value[0]);
    },
    initChart() {
      this.chartDom = echarts.init(document.getElementById('bidChart'));
      this.chartDom.setOption(bidChartOption);
    },
    initCurrentMaterial(value) {
      this.currentMaterial = this.materialList.filter((item) => item.id === value)[0];
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
  position: absolute;
  right: 48px;
  z-index: 9999;
}
.date-check {
  margin-left: 24px;
}
</style>
