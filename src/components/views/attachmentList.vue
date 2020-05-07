<template>
  <div v-if="showUpdate">
    <h4>
      <i class="el-icon-link"></i> 附件
      <el-button size="mini" v-if="addBtn" @click="listRowAdd">新增行</el-button>
    </h4>
    <fast2-theme-provider :option="option" theme="block" version="attahcment-fiels_2_2">
      <template v-slot="component">
        <div v-if="component.option && component.option.column && component.option.column.length">
          <avue-crud :data="fileList" :option="component.option" @row-del="handleDelete">
            <template v-slot:fileAction="scope">
              <div>
                <el-upload
                  :show-file-list="false"
                  class="upload-box"
                  ref="uploadBox"
                  :http-request="uploadFile"
                  action="/"
                >
                  <el-link
                    size="small"
                    slot="trigger"
                    type="primary"
                    @click="setUploadRow(scope.row)"
                    >上传</el-link
                  >
                  /
                  <el-link
                    download
                    target="_blank"
                    :href="`http://cs.51qqt.com${scope.row.attachmentUrl}`"
                  >
                    下载
                  </el-link>
                </el-upload>
              </div>
            </template>
          </avue-crud>
        </div>
      </template>
    </fast2-theme-provider>
  </div>
</template>

<script>
import commonApi from '@/api/common';
import { formatDate } from '@/util/date';
import { renderSize } from '@/util/utils';
import { validatenull } from '@/util/validate';

export default {
  name: 'attachment-list',
  inheritAttrs: false,
  props: {
    id: {
      type: String,
      default: null
    },
    addBtn: {
      type: Boolean,
      default: true
    },
    list: {
      type: Array,
      default: () => {
        return [];
      }
    },
    option: {
      type: Object,
      default: () => {
        return {
          // menu: false,
          editBtn: false,
          addBtn: true,
          showSummary: false,
          column: [
            {
              label: '文件',
              prop: 'fileAction',
              slot: true
            }
          ]
        };
      }
    }
  },
  data() {
    return {
      showUpdate: true,
      uploadRow: null,
      fileList: []
    };
  },
  created() {
    this.getList();
  },
  watch: {
    id(newValue) {
      this.showUpdate = !validatenull(newValue);
      console.log('this.showUpdate', this.showUpdate);
    }
  },
  methods: {
    doAction(action, data) {
      this.$emit(action, data);
      // this.$message.success(action)
    },
    // 可增加行方法
    downloadFile(row) {
      console.log('row', row);
      if (row.attachmentUrl) {
        let params = {
          elsAccount: row.elsAccount,
          elsSubAccount: row.elsSubAccount,
          filePath: `http://cs.51qqt.com${row.attachmentUrl}`
        };
        commonApi.download(params).then((res) => {
          if (res.data.statusCode !== '200') this.$message.error(res.data.message);
        });
      }
    },
    async getBase64(file) {
      return new Promise((resolve, reject) => {
        let reader = new FileReader();
        let fileResult = '';
        reader.readAsDataURL(file); // 开始转
        reader.onload = function() {
          fileResult = reader.result;
        }; // 转 失败
        reader.onerror = function(error) {
          reject(error);
        }; // 转 结束  咱就 resolve 出去
        reader.onloadend = function() {
          resolve(fileResult);
        };
      });
    },
    getList() {
      let action = 'findList';
      let params = {
        businessElsAccount: '307000',
        businessModule: 'inspectTableAudit',
        businessId: this.id
      };
      commonApi.attachmentServer(action, params).then((res) => {
        if (res.data.pageData && res.data.pageData.rows) {
          this.fileList = res.data.pageData.rows;
        }
      });
    },
    handleDelete(row, index) {
      this.$confirm('是否删除该附件？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let action = 'delete';
        if (row.uuid) {
          commonApi.attachmentServer(action, { uuid: this.uploadRow.uuid }).then((res) => {
            if (res.data.statusCode !== '200') {
              this.$message.error(res.data.message);
              return;
            }
            this.fileList.splice(index, 1);
          });
        }
      });
    },
    listRowAdd() {
      let fileItem = {
        businessItemId: this.id + '_00' + (this.fileList.length + 1)
      };
      this.fileList.push(fileItem);
    },
    // removeFile() {
    //   let action = 'delete';
    //   if (this.uploadRow.uuid) {
    //     commonApi.attachmentServer(action, { uuid: this.uploadRow.uuid });
    //   }
    // },
    setUploadRow(row) {
      this.uploadRow = row;
    },
    async uploadFile(myfile) {
      console.log('开始上传');
      let fileSize = renderSize(myfile.file.size);
      this.getBase64(myfile.file)
        .then((resBase64) => {
          let fileBase64 = resBase64.split(',')[1]; // 直接拿到base64信息
          let params = {
            fileName: myfile.file.name,
            fileType: myfile.file.name.split('.')[1],
            fileData: fileBase64
          };
          return commonApi.uploadFile(params);
        })
        .then((res) => {
          if (res.data.statusCode === '200') {
            let data = res.data.data;
            data.fileSize = fileSize;
            this.$emit('upload-file', data);
            this.updateFileList(data);
          } else {
            this.$message({
              message: res.data.message,
              type: 'error'
            });
          }
        });
    },
    updateFileList(file) {
      let action = this.uploadRow.attachmentName ? 'update' : 'create';
      let checkProp = 'businessItemId';
      let uploadRow = {
        ...this.uploadRow,
        attachmentType: file.fileType,
        attachmentSize: file.fileSize,
        attachmentName: file.fileName,
        attachmentDesc: file.fileName,
        attachmentUrl: file.filePath,
        businessModule: 'inspectTableAudit',
        businessElsAccount: '307000',
        businessId: this.id
      };
      delete uploadRow.createDate;
      commonApi.attachmentServer(action, uploadRow).then((res) => {
        if (res.data.statusCode === '200') {
          uploadRow = {
            ...uploadRow,
            ...res.data.data,
            elsAccount: res.data.data.elsAccount,
            elsSubAccount: res.data.data.elsSubAccount,
            attachmentType: res.data.data.attachmentType,
            createUser: res.data.data.createUser,
            createDate: formatDate(new Date(res.data.data.createDate), 'yyyy-MM-dd hh:mm:ss')
          };
          this.fileList = this.fileList.map((item) => {
            return item[checkProp] === uploadRow[checkProp] ? uploadRow : item;
          });
        } else {
          this.$message.error(res.data.message);
        }
      });
    }
  }
};
</script>
