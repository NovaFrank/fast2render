<template>
  <div>
    <avue-tabs :option="tabOption.option" @change="handleTabChange"></avue-tabs>
    <avue-crud
      :data="tableOption.data"
      :option="tableOption.option"
      :page.sync="tableOption.page"
      v-model="tableOption.obj"
      @size-change="sizeChange"
      @current-change="currentChange">
      <!--<template slot-scope="scope" slot="menuRight">
        <el-button
          type="primary"
          @click.stop="handleAddShow('新建类型', {})">新建</el-button>
      </template>-->
      <template slot-scope="scope" slot="menu">
        <el-row :gutter="24">
          <el-col :span="6">
            <a class="scope-btn" @click.stop="handleAddShow('编辑类型', scope.row)">
              编辑
            </a>
          </el-col>
          <el-col :span="6">
            <a class="scope-btn" @click.stop="handleDelete(scope.row)">
              删除
            </a>
          </el-col>
        </el-row>
      </template>
    </avue-crud>
  </div>
</template>

<script>
  import tabOption from '@/const/rfq/tabs'
  import tableOption from '@/const/rfq/index'
  import { elsFromSta } from '@/api/rfq'

  export default {
    components: {
      // fieldDialog
    },
    data(){
      return{
        tabOption: tabOption,
        tableOption: tableOption,
        tabActive: 'all'
      }
    },
    created() {
      this.tableData()
    },
    watch: {
      tabActive() {
        this.tableData()
      }
    },
    methods:{
      currentChange(val) {
        this.tableOption.page.currentPage = val
        this.tableData({
          currentPage: val,
          pageSize: this.tableOption.page.pageSize
        })
      },
      handleDelete(row) {
        this.$confirm('确定删除？', '提示').then(() => {
          let params = {
            elsAccount: row.elsAccount,
            whetherDefault: row.whetherDefault,
            fromDesc: row.fromDesc,
            fromBusiness: row.fromBusiness,
            fbk1: this.fbk1
          }
          elsFromSta('delElsFromSta', params).then(res => {
            if (res.data.statusCode) {
              this.$message.error(res.data.message)
              return
            }
            this.$message.success('删除成功')
            this.tableData()
          })
        })
      },
      handleTabChange(value) {
        this.fbk1 = value.prop
      },
      onSaveForm(form) {
        let params = {
          elsAccount: form.elsAccount,
          whetherDefault: form.whetherDefault,
          fromDesc: form.fromDesc,
          fromBusiness: form.fromBusiness
        }
        let action = 'saveElsFromSta'
        if (this.dialogTitle === '新建类型') {
          action = 'insertElsFromSta'
          params = {
            ...params,
            fbk1: this.fbk1
          }
        }
        elsFromSta(action, params).then(res => {
          if (res.data.statusCode) {
            this.$message.error(res.data.message)
            return
          }
          this.$message.success('保存成功')
          this.tableData()
        })
      },
      sizeChange(val) {
        this.tableOption.page.pageSize = val
        this.tableData({
          currentPage: 1,
          pageSize: val
        })
      },
      tableData(data) {
        const params = {
          pageSize: this.tableOption.page.pageSize || 10,
          currentPage: 1,
          ...data,
          tabActive: this.tabActive
        }
        elsFromSta('queryElsFromSta', params).then(res => {
          if (res.data.statusCode) {
            this.$message.error(res.data.message)
            return
          }
          this.tableOption.data = res.data.rows
          this.tableOption.page.total = res.data.total
        })
      },
    }
  }
</script>

<style>
  .scope-btn {
    color: #409EFF;
    cursor: pointer;
  }
</style>