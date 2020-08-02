import axios from '../axios';
import { getUserInfo } from '../auth';
import { getApiPath } from '../utils';
const baseUrl = getApiPath();
const userInfo = getUserInfo();
const elsAccount = userInfo.elsAccount || '307000';
const elsSubAccount = userInfo.elsSubAccount || '1001';

// POST /ElsAttachmentService/send
export const sendFiles = (params) => {
  return axios({
    url: `${baseUrl}/ElsAttachmentService/send`,
    method: 'post',
    data: params
  });
};

export const downloadServlet = (url) => {
  return axios({
    url: `${baseUrl}/servlet/downloadServlet?filePath=${url}`,
    method: 'get'
  });
};

export const uploadFile = (params) => {
  return axios({
    url: `${baseUrl}/FileService/uploadFile`,
    method: 'post',
    data: {
      elsAccount,
      elsSubAccount,
      ...params
    }
  });
};

export const download = (params) => {
  return axios({
    url: `${baseUrl}/FileService/downloadFile`,
    method: 'post',
    data: {
      elsAccount,
      elsSubAccount,
      ...params
    }
  });
};

export const attachmentServer = (action, params) => {
  return axios({
    url: `${baseUrl}/ElsAttachmentService/${action}`,
    method: 'post',
    data: {
      elsAccount,
      elsSubAccount,
      ...params
    }
  });
};

const uploadApi = {
  sendFiles,
  downloadServlet,
  uploadFile,
  attachmentServer,
  download
};
export default uploadApi;
