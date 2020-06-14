import axios from '@/router/axios';

const baseUrl = '/apis';

export const find = (params) => {
  const url = `${baseUrl}/ElsTemplateConfigService/findPageList`;

  return axios({
    url: url,
    method: 'post',
    data: {
      ...params
    }
  });
};

/**
 * get template configuration
 * @param {sting} templateNumber
 * @param {string} templateVersion
 * @returns
 */
const getConfig = (templateNumber, templateVersion) => {
  return axios({
    url: `${baseUrl}/ElsTemplateConfigService/getConfig/${templateNumber}/${templateVersion}`,
    method: 'get'
  });
};

export const ElsTemplateConfigService = {
  find,
  getConfig
};
