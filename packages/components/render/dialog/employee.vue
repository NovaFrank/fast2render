<template>
  <div class="selectBox">
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
        @click="visable = true"
      />
    </el-input>
    <el-dialog
      :title="title"
      :visible.sync="visable"
    >
      <avue-crud
        ref="crud"
        v-model="crudObj"
        :data.sync="crudData"
        :option.sync="crudOption"
        :page.sync="crudPage"
        @selection-change="selectionChange"
        @search-change="searchChange"
        @refresh-change="refreshChange"
        @current-change="currentChange"
        @size-change="sizeChange"
        @current-row-change="currentRowChange"
      >
        <template slot="menuLeft">
          <el-button
            type="primary"
            size="small"
            plain
            @click.stop="crudSave()"
          >
            {{
              btnText
            }}
          </el-button>
        </template>
      </avue-crud>
    </el-dialog>
  </div>
</template>
<script>
import { ElsAccountService } from '../../../lib/api/materials';
import { getUserInfo } from '../../../lib/auth';
export default {
  name: 'SelectEmployee',
  props: {
    elsAccount: { type: String, default: '' }, // elsAccount
    elsSubAccount: { type: String, default: '' }, // elsSubAccount
    btnText: { type: String, default: '保存' }, // 保存按钮文字
    title: { type: String, default: '' }, // dialog标题
    seleted: { type: String, default: '' },
    actionPath: { type: String, default: null }, // 数据接口地址

    dialogVisible: { type: Boolean, default: false }, // dialog显隐
    isDisabled: { type: Boolean, default: false }, // 是否禁用
    multiple: { type: Boolean, default: false }, // 是否多选

    // 表格的列配置
    column: {
      type: Array,
      default: () => {
        return [
          {
            label: '子账号',
            prop: 'elsSubAccount',
            overHidden: true
          },
          {
            label: '姓名',
            prop: 'name',
            overHidden: true
          }
        ];
      }
    },
    // 表格的分页配置
    page: {
      type: Object,
      default: () => {
        return { total: 0, currentPage: 1, pageSize: 10 };
      }
    }
  },
  data() {
    return {
      visable: this.dialogVisible,
      selectColumns: [],
      crudObj: {},
      crudData: [],
      crudOption: {
        indexLabel: '序号',
        indexFixed: false,
        searchShow: false,
        searchBtn: false,
        columnBtn: false,
        align: 'center',
        menu: false,
        border: true,
        highlightCurrentRow: true,
        selection: true,
        stripe: true,
        page: true,
        addBtn: false,
        editBtn: false,
        delBtn: false,
        index: true,
        sortable: true,
        tip: false,
        indeterminate: true,
        column: []
      },
      crudPage: {
        total: 0, // 总页数
        currentPage: 1, // 当前页数
        pageSize: 10 // 每页显示多少条
      },
      crudPageParam: {
        currentPage: 1,
        pageSize: 10
      },
      crudMultiple: true
    };
  },
  watch: {
    page: function(newValue) {
      this.crudPage = newValue;
    },
    column: function(newValue) {
      this.crudOption.column = newValue;
    },
    visable: function(newValue) {
      this.$emit('update:dialogVisible', newValue);
    },
    dialogVisible: function(newValue) {
      this.visable = newValue;
    }
  },
  created() {
    this.crudOption.column = this.column;
    this.crudPage = this.page;
    this.crudMultiple = this.multiple;
    this.crudOption.selection = this.multiple;
    this.crudOption.highlightCurrentRow = !this.multiple;
    this.handleEmployeeList();
  },
  methods: {
    handleEmployeeList() {
      const listParams = {};
      listParams.elsAccount = getUserInfo().elsAccount;
      // listParams.toElsAccout = '307001';
      listParams.currentPage = this.crudPage.currentPage;
      listParams.pageSize = this.crudPage.pageSize;
      ElsAccountService.listEmployee(listParams).then((res) => {
        const data = res.data;
        if (data.statusCode !== '200') {
          this.$message.error(data.message);
          return;
        }
        this.crudData = data.pageData.rows;
        this.crudPage.total = data.pageData.total;
        this.crudPage.currentPage = this.crudPageParam.currentPage;
        this.crudPage.pageSize = this.crudPageParam.pageSize;
      });
    },
    crudSave() {
      const selectItems = this.selectColumns;
      this.selectColumns = [];
      this.$refs.crud.selectClear();
      this.$emit('selectDone', selectItems);
      this.visable = false;
    },
    selectionChange(list) {
      if (this.crudMultiple) {
        this.selectColumns = list;
        let str = '';
        list.map((item) => {
          str += item.elsSubAccount + '_' + item.name + ' ';
        });
        this.seleted = str;
      }
    },
    currentRowChange(row) {
      if (!this.crudMultiple) {
        const list = [];
        list.push(row);
        this.selectColumns = list;
        let str = '';
        list.map((item) => {
          str += item.elsSubAccount + '_' + item.name + ' ';
        });
        this.seleted = str;
      }
    },
    searchChange(params, done) {
      this.crudPageParam.currentPage = 1;
      // Object.assign(this.crudQueryParam, params);
      this.handThisList();
      done();
    },
    refreshChange() {
      this.crudPageParam.currentPage = 1;
      this.handThisList();
    },
    currentChange(page) {
      this.crudPageParam.currentPage = page;
      this.handThisList();
    },
    sizeChange(pageSize) {
      this.crudPageParam.currentPage = 1;
      this.crudPageParam.pageSize = pageSize;
      this.handThisList();
    }
  }
};
</script>
