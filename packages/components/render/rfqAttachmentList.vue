<template>
  <div>
    <h4>
      <i class="el-icon-link" /> <span v-if="!readonly">附件</span><span v-else>上传附件</span>
      <el-button v-if="addBtn && !readonly" size="mini" @click="listRowAdd">
        新增行
      </el-button>
    </h4>
    <fast2-theme-provider :option="readonly ? readOption : option" theme="block" :version="version">
      <template v-slot="component">
        <div v-if="component.option && component.option.column && component.option.column.length">
          <avue-crud :data="fileList" :option="component.option" @row-del="handleDelete">
            <template v-slot:fileAction="scope">
              <div v-if="!readonly && downloadClient" @mouseover="setUploadRow(scope.row)">
                <fast2-upload
                  @file-success="fileSuccess"
                  @file-progress="onFileProgress"
                  @file-error="onFileError"
                  @click="setUploadRow(scope.row)"
                />
              </div>
              <div v-else-if="downloadClient">
                <el-link
                  v-if="scope.row.attachmentUrl"
                  download
                  target="_blank"
                  :href="`${dome}opt/nfsshare/${scope.row.attachmentUrl}`"
                >
                  下载
                </el-link>
              </div>
            </template>
            <template slot="annexType" slot-scope="{ row }">
              <span v-if="row.isRequired === 'Y'" class="annexType" />{{ row.annexType }}
            </template>
          </avue-crud>
        </div>
      </template>
    </fast2-theme-provider>
  </div>
</template>

<script>
import uploadApi from '../../lib/api/upload';
import { formatDate, getApiPath } from '../../lib/utils'; // , renderSize
import { validateNull } from '../../lib/validate';
import { getUserInfo } from '../../lib/auth';

const BaseUrl = getApiPath();

export default {
  name: 'RfqAttachmentList',
  props: {
    // 是否屏蔽下载供应商附件
    downloadClient: {
      type: Boolean,
      default: true
    },
    // 跳过 是否判断供应商以及供应商tab
    passClient: {
      type: Boolean,
      default: true
    },
    // 是否为供应商端
    client: {
      type: Boolean,
      default: true
    },
    // 是否为供应商tab
    clientTab: {
      type: Boolean,
      default: true
    },
    version: {
      type: String,
      default: 'attahcment-fiels_4_3'
    },
    domain: {
      type: String,
      default: () => {
        return null;
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
    option: {
      type: Object,
      default: () => {
        return {
          editBtn: false,
          addBtn: false,
          delBtn: true,
          cancelBtn: false,
          showSummary: false,
          rowKey: 'businessItemId',
          column: [
            {
              label: '文件',
              prop: 'fileAction',
              slot: true
            },
            {
              label: '是否启用有效期',
              prop: 'isValidity',
              hide: true
            },
            {
              label: '文件类型',
              prop: 'annexType',
              type: 'input',
              span: 8,
              orderIndex: 0,
              order: 1,
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
          detail: true,
          editBtn: false,
          addBtn: false,
          delBtn: false,
          cancelBtn: false,
          showSummary: false,
          column: [
            {
              label: '文件',
              prop: 'fileAction',
              slot: true
            },
            {
              label: '是否启用有效期',
              prop: 'isValidity',
              hide: true
            },
            {
              label: '文件类型',
              prop: 'annexType',
              type: 'input',
              span: 8,
              orderIndex: 0,
              order: 1,
              slot: true
            }
          ]
        };
      }
    }
  },
  data() {
    return {
      currentElsAccount: '',
      dome: '',
      showUpdate: true,
      uploadRow: null,
      fileList: [],
      businessId: '',
      uploader: null
    };
  },
  watch: {
    id(newValue) {
      this.businessId = newValue;
      this.initData();
    },
    attachmentTemplate() {
      this.initData();
    },
    fileList(newVal) {
      console.log(newVal);
    }
  },
  created() {},
  mounted() {
    const currentUserInfo = getUserInfo();
    this.currentElsAccount = currentUserInfo.elsAccount;
    // this.initWebUpload();
    if (!validateNull(this.id)) {
      this.businessId = this.id;
      this.initData();
    }
    if (window.location.host.includes('uat')) {
      this.dome = 'https://uat.51qqt.com/';
    } else {
      // uat 环境定位到 v4 版本
      this.dome = 'http://cs.51qqt.com/';
    }
    if (this.domain) {
      this.dome = this.domain;
    }
  },
  methods: {
    doAction(action, data) {
      this.$emit(action, data);
      // this.$message.success(action)
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
          uploadApi.attachmentServer(action, { uuid: row.uuid }).then((res) => {
            if (res.data.statusCode !== '200') {
              this.$message.error(res.data.message);
              return;
            }
            this.fileList.splice(index, 1);
          });
        }
      });
    },

    handleDownload(row) {
      console.log(row);
    },

    handleSuccess(response, file, fileList) {
      console.log(response, file, fileList);
    },

    download(blobUrl, fileName) {
      const a = document.createElement('a');
      a.download = fileName;
      a.href = blobUrl;
      a.click();
      document.body.removeChild(a);
    },

    // 可增加行方法
    downloadFile(row) {
      if (row.attachmentUrl) {
        const params = {
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
        const reader = new FileReader();
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
      const action = 'findList';
      const params = {
        businessElsAccount: this.businessElsAccount,
        businessModule: this.businessModule,
        businessId: this.businessId
      };
      uploadApi.attachmentServer(action, params).then((res) => {
        if (res.data.pageData && res.data.pageData.rows) {
          if (this.passClient) {
            this.fileList = res.data.pageData.rows;
          } else {
            if (this.client && this.clientTab) {
              this.fileList = res.data.pageData.rows.filter(
                (item) => item.elsAccount === this.elsAccount
              );
            } else if (this.client && !this.clientTab) {
              this.fileList = res.data.pageData.rows.filter(
                (item) => item.elsAccount !== this.elsAccount
              );
            } else if (!this.client && !this.clientTab) {
              this.fileList = res.data.pageData.rows.filter(
                (item) => item.elsAccount === this.businessElsAccount
              );
            } else if (!this.client && this.clientTab) {
              this.fileList = res.data.pageData.rows.filter(
                (item) => item.elsAccount !== this.businessElsAccount
              );
            }
          }
        }
        // businessItemId 根据该值判断 替换或直接push
        const itemIds = this.fileList.map((item) => item.businessItemId);
        this.attachmentTemplate.forEach((item) => {
          // item.isValidity = true; // TODO:
          if (itemIds.includes(item.businessItemId)) {
            const index = this.fileList.findIndex(
              (file) => file.businessItemId === item.businessItemId
            );
            const i = this.fileList[index];
            item.isValidity === 'Y' && this.readonly === false
              ? (i.$cellEdit = true)
              : (i.$cellEdit = false);
            i.isValidity = validateNull(item.isValidity) ? false : item.isValidity;
            i.startValidity = validateNull(item.startValidity) ? '' : item.startValidity;
            i.endValidity = validateNull(item.endValidity) ? '' : item.endValidity;
            this.fileList[index] = {
              ...item,
              ...i
            };
          } else {
            item.isValidity === 'Y' && this.readonly === false
              ? (item.$cellEdit = true)
              : (item.$cellEdit = false);
            // item.isValidity = validateNull(item.isValidity) ? false : item.isValidity;
            item.startValidity = validateNull(item.startValidity) ? '' : item.startValidity;
            item.endValidity = validateNull(item.endValidity) ? '' : item.endValidity;
            this.fileList.push(item);
          }
        });
        console.log('this.fileList', this.fileList);
      });
    },

    initData() {
      this.showUpdate = !validateNull(this.id);
      if (!validateNull(this.businessId)) {
        this.option.delBtn = this.delBtn;
        this.getList();

        /*
        const dic = this.$getDicItem('attachmentType');
        this.readOption.column.unshift({
          label: '文件类型',
          prop: 'attachmentType',
          type: 'select',
          order: 0,
          dicData: dic
        });
        */
      }
    },

    // 如果存在模版数据，需要初始化
    initList() {
      // 先初始化待上传列表
      this.attachmentTemplate.map((item) => {
        this.listTempRowAdd(item);
      });
      //  有id 为读取模式， 没id 为模版预览模式
      if (this.id) {
        this.getList();
        this.$forceUpdate();
      }
    },

    listRowAdd() {
      const fileItem = {
        elsAccount: this.elsAccount,
        businessItemId: this.id + '_00' + (this.fileList.length + 1)
      };
      this.fileList.push(fileItem);
    },

    listTempRowAdd(item) {
      if (!item) {
        return;
      }
      const type = item.attachmentType || item.fileType;
      if (!type) {
        return;
      }
      const fileItem = {
        businessItemId: this.id + type + (this.fileList.length + 1),
        attachmentType: type
      };
      this.fileList.push(fileItem);
    },

    /*
    removeFile() {
      const action = 'delete';
      if (this.uploadRow.uuid) {
        uploadApi.attachmentServer(action, { uuid: this.uploadRow.uuid });
      }
    },
    */

    sendFiles() {
      const list = this.fileList.filter((item) => item.uuid); // 过滤掉未上传过的行数据
      return new Promise((resolve, reject) => {
        if (list.length > 0) {
          const params = {
            businessItemIds: list.map((item) => item.uuid).toString()
          };
          uploadApi
            .sendFiles(params)
            .then((res) => {
              if (res.data.statusCode === '200') {
                resolve({ result: true, statusCode: res.data.statusCode });
              } else {
                resolve({
                  result: false,
                  message: res.data.message,
                  statusCode: res.data.statusCode
                });
              }
            })
            .catch((res) => {
              reject(res);
            });
        } else {
          // eslint-disable-next-line prefer-promise-reject-errors
          resolve({ result: true, statusCode: '200' });
          // reject({
          //   result: false,
          //   message: '请上传附件',
          //   statusCode: '-100'
          // });
        }
      });
    },

    setUploadRow(row) {
      this.uploadRow = row;
    },
    fileSuccess(rootFile, file, message, chunk) {
      console.log(message);
      const data = JSON.parse(message)?.data;
      // 将面试邀请code和文件路径去保存到数据库中
      const fileData = {
        fileSize: data.size,
        fileName: data.name,
        fileType: data.type,
        filePath: data.url
      };
      this.$emit('upload-file', fileData);
      this.updateFileList(fileData);
    },
    onFileProgress() {
      console.log('文件上传中');
    },
    onFileError() {
      this.$message.error('上传失败，请重新尝试');
    },
    updateFileList(file) {
      const _this = this;
      const action = _this.uploadRow?.attachmentName
        ? 'update'
        : _this.uploadRow.uuid
        ? 'update'
        : 'create';
      const checkProp = 'businessItemId';
      console.log('this.elsAccount', this.elsAccount);
      let itemRow = {
        ...this.uploadRow,
        elsAccount: this.elsAccount,
        attachmentType: file.fileType,
        attachmentSize: file.fileSize,
        attachmentName: file.fileName,
        attachmentDesc: file.fileName,
        attachmentUrl: file.filePath,
        businessModule: this.businessModule,
        businessElsAccount: this.businessElsAccount,
        businessId: this.businessId
      };
      const uploadRow = {
        ...this.uploadRow,
        elsAttachmentVOList: [itemRow]
      };
      delete uploadRow.createDate;
      uploadApi.attachmentServer(action, uploadRow).then((res) => {
        if (res.data.statusCode === '200') {
          const elsAttachment = res.data.data.elsAttachmentVOList[0];
          console.log('elsAttachment', uploadRow, this.fileList, elsAttachment);
          itemRow = {
            ...itemRow,
            ...elsAttachment,
            attachmentType: file.fileType,
            elsAccount: res.data.data.elsAccount,
            elsSubAccount: res.data.data.elsSubAccount,
            createUser: elsAttachment.createUser,
            createDate: formatDate(new Date(elsAttachment.createDate), 'yyyy-MM-dd hh:mm:ss')
          };
          this.fileList = this.fileList.map((item) => {
            return item[checkProp] === uploadRow[checkProp] ? itemRow : item;
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

<style lang="scss" scoped>
.annexType::after {
  content: '*';
  color: #f56c6c;
  margin-right: 4px;
}
</style>
