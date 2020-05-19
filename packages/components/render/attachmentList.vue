<template>
  <div>
    <h4>
      <i class="el-icon-link"></i> <span v-if="!readonly">附件</span><span v-else>上传附件</span>
      <el-button size="mini" v-if="addBtn && !readonly" @click="listRowAdd">新增行</el-button>
    </h4>
    <fast2-theme-provider :option="readonly ? readOption : option" theme="block" :version="version">
      <template v-slot="component">
        <div v-if="component.option && component.option.column && component.option.column.length">
          <avue-crud :data="fileList" :option="component.option" @row-del="handleDelete">
            <template v-slot:fileAction="scope">
              <div v-if="!readonly">
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
                  >
                    上传
                  </el-link>
                  <template v-if="scope.row.attachmentUrl">
                    /
                    <el-link
                      v-if="scope.row.attachmentUrl"
                      download
                      target="_blank"
                      :href="`${dome}${scope.row.attachmentUrl}`"
                    >
                      下载
                    </el-link>
                  </template>
                </el-upload>
              </div>
              <div v-else>
                <el-link
                  v-if="scope.row.attachmentUrl"
                  download
                  target="_blank"
                  :href="`${dome}${scope.row.attachmentUrl}`"
                >
                  下载
                </el-link>
              </div>
            </template>
          </avue-crud>
        </div>
      </template>
    </fast2-theme-provider>
  </div>
</template>

<script>
import uploadApi from '../../lib/api/upload';
import { formatDate, renderSize } from '../../lib/utils';
import { validateNull } from '../../lib/validate';

export default {
  name: 'AttachmentList',
  props: {
    version: {
      type: String,
      default: () => {
        return 'attahcment-fiels_2_2';
      }
    },
    readonly: {
      type: Boolean,
      default: false
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
    attachmentTemplate: {
      type: Array,
      default: function() {
        return [];
      }
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
    delBtn: {
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
          editBtn: false,
          addBtn: false,
          delBtn: true,
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
    },
    readOption: {
      default: () => {
        return {
          menu: false,
          editBtn: false,
          addBtn: false,
          delBtn: false,
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
      dome: 'http://cs.51qqt.com',
      showUpdate: true,
      uploadRow: null,
      fileList: []
    };
  },
  created() {
    this.option.delBtn = this.delBtn;
    this.getList();
    if (!this.attachmentTemplate.length) {
      this.getList();
    } else {
      let dic = this.$getDicItem('attachmentType');
      this.readOption.column.unshift({
        label: '文件类型',
        prop: 'attachmentType',
        type: 'select',
        order: 0,
        dicData: dic
      });
      this.initList();
    }
  },
  watch: {
    id(newValue) {
      this.showUpdate = !validateNull(newValue);
    }
  },
  methods: {
    doAction(action, data) {
      this.$emit(action, data);
      // this.$message.success(action)
    },
    // 如果存在模版数据，需要初始化
    initList() {
      // 先初始化待上传列表
      this.attachmentTemplate.map((item) => {
        this.listTempRowAdd(item);
      });
      const list = this.fileList;
      console.log('list', list);
      //  有id 为读取模式， 没id 为模版预览模式
      if (this.id) {
        this.getList();
        this.$forceUpdate();
      }
    },
    // 可增加行方法
    downloadFile(row) {
      if (row.attachmentUrl) {
        let params = {
          elsAccount: row.elsAccount,
          elsSubAccount: row.elsSubAccount,
          filePath: `${this.dome}${row.attachmentUrl}`
        };
        uploadApi.download(params).then((res) => {
          if (res.data.statusCode !== '200') {
            this.$message.error(res.data.message);
          }
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
        businessElsAccount: this.businessElsAccount,
        businessModule: this.businessModule,
        businessId: this.id
      };
      uploadApi.attachmentServer(action, params).then((res) => {
        if (res.data.pageData && res.data.pageData.rows) {
          this.fileList = res.data.pageData.rows;
        }
        // businessItemId 根据该值判断 替换或直接push
        const itemIds = this.fileList.map((item) => item.businessItemId);
        this.list.forEach((item) => {
          if (itemIds.includes(item.businessItemId)) {
            const index = this.fileList.findIndex(
              (file) => file.businessItemId === item.businessItemId
            );
            this.fileList[index] = {
              ...item,
              ...this.fileList[index]
            };
          } else {
            this.fileList.push(item);
          }
        });
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
        let action = 'delete';
        if (row.uuid) {
          uploadApi.attachmentServer(action, { uuid: this.uploadRow.uuid }).then((res) => {
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
    listTempRowAdd(item) {
      if (!item) {
        return;
      }
      let type = item.attachmentType || item.fileType;
      if (!type) {
        return;
      }
      let fileItem = {
        businessItemId: this.id + type + (this.fileList.length + 1),
        attachmentType: type
      };
      this.fileList.push(fileItem);
      this.list.push(fileItem);
    },
    // removeFile() {
    //   let action = 'delete';
    //   if (this.uploadRow.uuid) {
    //     uploadApi.attachmentServer(action, { uuid: this.uploadRow.uuid });
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
          return uploadApi.uploadFile(params);
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
      const _this = this;
      let action = _this.uploadRow.attachmentName
        ? 'update'
        : _this.uploadRow.businessItemId
        ? 'update'
        : 'create';
      let checkProp = 'businessItemId';
      let uploadRow = {
        elsAttachmentVOList: [
          {
            ...this.uploadRow,
            // attachmentType: file.fileType,
            attachmentSize: file.fileSize,
            attachmentName: file.fileName,
            attachmentDesc: file.fileName,
            attachmentUrl: file.filePath,
            businessModule: this.businessModule,
            businessElsAccount: this.businessElsAccount,
            businessId: this.id
          }
        ]
      };
      delete uploadRow.createDate;
      uploadApi.attachmentServer(action, uploadRow).then((res) => {
        if (res.data.statusCode === '200') {
          uploadRow = {
            ...uploadRow,
            ...res.data.data,
            elsAccount: res.data.data.elsAccount,
            elsSubAccount: res.data.data.elsSubAccount,
            attachmentType: res.data.data.attachmentType,
            createUser: res.data.data.createUser,
            createDate: formatDate(new Date(res.data.data.lastUpdateDate), 'yyyy-MM-dd hh:mm:ss')
          };
          this.fileList = this.fileList.map((item) => {
            return item[checkProp] === uploadRow[checkProp] ? uploadRow : item;
          });
          this.$message.success('上传成功');
        } else {
          this.$message.error(res.data.message);
        }
      });
    }
  }
};
</script>
