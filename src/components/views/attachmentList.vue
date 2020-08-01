<template>
  <div>
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
    version: {
      type: String,
      default: () => {
        return 'attahcment-fiels_2_2';
      }
    },
    menu: {
      type: Boolean,
      default: true
    },
    id: {
      type: String,
      default: null
    },
    elsAccount: {
      type: String,
      default: null
    },
    businessElsAccount: {
      type: String,
      default: null
    },
    businessModule: {
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
      // console.log('this.showUpdate', this.showUpdate);
    }
  },
  methods: {
    doAction(action, data) {
      this.$emit(action, data);
      // this.$message.success(action)
    },
    // 可增加行方法
    downloadFile(row) {
      if (row.attachmentUrl) {
        const params = {
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
        const reader = new FileReader();
        let fileResult = '';
        reader.readAsDataURL(file); // 开始转
        reader.onload = function () {
          fileResult = reader.result;
        }; // 转 失败
        reader.onerror = function (error) {
          reject(error);
        }; // 转 结束  咱就 resolve 出去
        reader.onloadend = function () {
          resolve(fileResult);
        };
      });
    },
    getList() {
      const action = 'findList';
      const params = {
        businessElsAccount: this.businessElsAccount,
        businessModule: this.businessModule,
        businessId: this.id
      };
      commonApi.attachmentServer(action, params).then((res) => {
        if (res.data.pageData && res.data.pageData.rows) {
          this.fileList = res.data.pageData.rows;
        }
      });
    },
    handleDelete(row, index) {
      if (!row.uuid) {
        this.fileList.splice(index, 1);
        return;
      }
      this.$confirm('是否删除该附件？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const action = 'delete';
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
      const fileItem = {
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
      const fileSize = renderSize(myfile.file.size);
      this.getBase64(myfile.file)
        .then((resBase64) => {
          const fileBase64 = resBase64.split(',')[1]; // 直接拿到base64信息
          const params = {
            fileName: myfile.file.name,
            fileType: myfile.file.name.split('.')[1],
            fileData: fileBase64
          };
          return commonApi.uploadFile(params);
        })
        .then((res) => {
          if (res.data.statusCode === '200') {
            const data = res.data.data;
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
      const action = this.uploadRow.attachmentName ? 'update' : 'create';
      const checkProp = 'businessItemId';
      let uploadRow = {
        ...this.uploadRow,
        attachmentType: file.fileType,
        attachmentSize: file.fileSize,
        attachmentName: file.fileName,
        attachmentDesc: file.fileName,
        attachmentUrl: file.filePath,
        businessModule: this.businessModule,
        businessElsAccount: this.businessElsAccount,
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
            createDate: formatDate(new Date(res.data.data.lastUpdateDate), 'yyyy-MM-dd HH:mm:ss')
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
