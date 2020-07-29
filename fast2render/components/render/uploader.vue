<template>
  <uploader :options="uploadOptions" v-on="$listeners" v-bind="$props" class="uploader-example">
    <uploader-unsupport></uploader-unsupport>
    <uploader-btn>上传</uploader-btn>
  </uploader>
</template>

<script>
import uploadApi from '../../lib/api/upload';
import { validateNull } from '../../lib/validate';
import { getApiPath } from '../../lib/utils';
import { getUserInfo } from '../../lib/auth';

export default {
  name: 'Upload',
  props: {
    domain: {
      type: String,
      default: () => {
        return null;
      }
    },
    id: {
      type: String,
      default: null
    },
    elsAccount: {
      type: String,
      default: null
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
      uploader: null,
      uploadOptions: {
        target: getApiPath() + '/FileUploadService/chunk/file_upload',
        testChunks: true, // 是否开启服务器分片校验
        chunkSize: '1024000', // 分块大小
        fileParameterName: 'file', // 上传文件时文件的参数名，默认file
        maxChunkRetries: 3, // 最大自动失败重试上传次数
        checkChunkUploadedByResponse: function(chunk, message) {
          const objMessage = JSON.parse(message);
          if (objMessage.skipUpload) {
            return true;
          }
          return (objMessage.uploaded || []).indexOf(chunk.offset + 1) >= 0;
        },
        headers: {
          // 在header中添加的验证，请根据实际业务来
          token: getUserInfo().token,
          account: `${getUserInfo().elsAccount}_${getUserInfo().elsSubAccount}`
        }
      },
      attrs: {
        accept: 'image/*'
      }
    };
  },
  created() {},
  mounted() {
    const currentUserInfo = getUserInfo();
    this.currentElsAccount = currentUserInfo.elsAccount;
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
  methods: {
    initData() {
      this.showUpdate = !validateNull(this.id);
      if (!validateNull(this.businessId)) {
        this.option.delBtn = this.delBtn;
        // let dic = this.$getDicItem('attachmentType');
        // this.readOption.column.unshift({
        //   label: '文件类型',
        //   prop: 'attachmentType',
        //   type: 'select',
        //   order: 0,
        //   dicData: dic
        // });
      }
    },
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
    handleSuccess(response, file, fileList) {
      console.log(response, file, fileList);
    }
  }
};
</script>
