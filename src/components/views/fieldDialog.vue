<template>
  <el-dialog
    :title="dialogTitle"
    :width="dialogWidth"
    :close-on-click-modal="false"
    :visible.sync="fieldDialogVisible"
    :before-close="closeDialog">
    <avue-form
      ref="form"
      :option="dialogOption"
      v-model="form"
      class='new-field'
    >
      <template slot-scope="scope" slot="menuForm">
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="handleSubmit">保存</el-button>
      </template>
    </avue-form>
  </el-dialog>
</template>

<script>
  export default {
    name: 'field-dialog',
    components: {
    },
    created: function () {
    },
    props: {
      dialogWidth: String,
      dialogTitle: String,
      dialogOption: Object,
      fieldDialogType: String,
      fieldDialogVisible: {
        type: Boolean,
        default: false,
      },
      field: {
        type: Object,
        default: (() => {
          return {
            elsAccount: '',
            fromBusiness: '',
          }
        })
      }
    },
    data() {
      return {
        form: {},
      }
    },
    watch: {
      field(newVal) {
        console.log('newVal', newVal)
        this.form = newVal
      }
    },
    methods: {
      closeDialog () {
        this.$emit('close-field-dialog')
      },
      handleSubmit() {
        this.$refs.form.validate(valid => {
          if (valid) {
            this.$emit('on-save-form', this.form)
          }
        })
      },
    }
  }
</script>


<style scoped>
  dialog.field-box{
    box-shadow: 0 3px 6px #dddddd;
    border-radius: 8px;
    border: none;
    padding: 50px 70px 80px 70px;
  }
  .modifyDia{
    padding: 50px 0!important;
    position: fixed;
    height: 100%;
    padding-top: 0;
    background-color: #fff
  }
  .modifyDia >>> .el-dialog{
    width: 100%;
    height: calc(100%);
    margin-top: 0!important;
    box-shadow: none;
  }
  .modifyDia >>> .el-dialog .el-dialog__header{
    display: none
  }
  .modifyDia >>> .el-button{
    width: 100%;
    margin-left: 1px;
  }
  .box-title{
    color: #606266;
    margin-bottom: 30px;
    padding-left: 30px;
    font-size:18px;
  }
  .close-icon{
    width:50px;
    height:50px;
    background-color: #dedee4;
    border-radius: 48px;
    text-align: center;
    position: fixed;
    right:20px;
    top:20px;
    line-height: 50px;
    color:#909399;
    font-size:32px;
    font-weight: bold;
    cursor: pointer;
  }
  .close-icon:hover{
    color:#409EFF;
  }
  .confirm-dialog__title {
    font-size: 22px;
    font-weight: 500;
    padding: 24px 24px 0;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    color: #475053;
  }

  .confirm-dialog__content {
    padding: 25px 24px 34px;
    color: #999;
  }
  .confirm-dialog__content ul{
    margin-left: 20px;
    margin-top: 10px;
  }
  .confirm-dialog__content ul li{
    list-style-type:disc;
    font-size: 14px;
  }
  .confirm-dialog__content b{
    color: #7d7f80;
    font-size: 18px
  }
  .confirm-dialog__content .confirm-dialog__input{
    width: 100%;
  }
  .confirm-dialog__content span{
    font-size: 16px;
    color: #475053;
  }
  .confirm-dialog__actions {
    padding: 8px 8px 8px 24px;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
  }

  .confirm-dialog__delete-btn {
    background-color: #ea493f !important;
    color:#fff;
    margin: 0;
  }
  .new-field >>> .el-input {
    border-bottom: 1px solid #DCDFE6;
  }
</style>
