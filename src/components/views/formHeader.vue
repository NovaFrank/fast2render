<template>
  <div class="form-header">
    <p class="form-title">{{ titleText }}</p>
    <div v-if="showButton" class="form-buttons">
      <el-button
        v-for="(button, index) in buttons.filter((item) => item.power)"
        :key="index"
        :type="button.type"
        :size="button.size"
        @click="handleClick(button.action)"
      >
        {{ button.text }}
      </el-button>
      <el-popover
        v-show="showHistoryButton"
        placement="bottom"
        width="180"
        trigger="click"
        @show="handleClick('show-time-history')"
      >
        <el-card
          body-style="padding: 6px 20px"
          shadow="hover"
          v-for="(item, index) in gridData"
          :key="item.id"
        >
          <p v-if="index === 0">当前</p>
          <p v-else-if="index !== 0">历史记录{{ index }}</p>
          <span>{{ item.modifyTime }}</span>
          <p>{{ item.modifier }}</p>
        </el-card>
        <!-- <el-table :data="gridData">
          <el-table-column width="120" property="modifier" label="操作人"></el-table-column>
          <el-table-column width="120" property="modifyTime" label="修改时间"></el-table-column>
          <el-table-column width="320" property="reason" label="备注"></el-table-column>
        </el-table> -->
        <el-button
          class="el-button el-button--text"
          style="font-size: 28px; height: 100%; margin-left: 10px"
          slot="reference"
        >
          <i class="el-icon-time"></i>
        </el-button>
      </el-popover>
    </div>
  </div>
</template>

<script>
import { formatDate } from '@/util/date';

export default {
  name: 'form-header',
  components: {},
  created: function() {},
  props: {
    showHistoryButton: {
      type: Boolean,
      default: true
    },
    titleText: String,
    showButton: {
      type: Boolean,
      default: false
    },
    timeHistory: Array,
    buttons: {
      type: Array,
      default: () => {
        return [
          {
            power: false,
            text: '取消',
            type: '',
            size: '',
            action: 'on-cancel'
          },
          {
            power: false,
            text: '发布',
            type: 'primary',
            size: '',
            action: 'on-release'
          },
          {
            power: false,
            text: '保存',
            type: 'primary',
            size: '',
            action: 'on-save'
          }
        ];
      }
    }
  },
  data() {
    return {
      gridData: []
    };
  },
  watch: {
    timeHistory(newValue) {
      this.gridData = newValue.map((item) => {
        return {
          id: item.id,
          modifyTime: formatDate(new Date(item.modifyTime), 'yyyy-MM-dd HH:mm:ss'),
          modifier: item.modifier
        };
      });
    }
  },
  methods: {
    handleClick(action) {
      this.$emit(action);
    }
  }
};
</script>

<style>
.form-header {
  display: flex;
  height: 80px;
  line-height: 80px;
}
.form-title {
  margin: 0px 20px;
  font-size: 18px;
  font-weight: bold;
}
.form-buttons {
  position: absolute;
  right: 20px;
}
</style>
