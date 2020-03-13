import axios from "axios";
const baseUrl = "https://cs.51qqt.com/qqt-srm/rest/";

export const getList = (elsAccount, page, params) => {
  // 采购申请管理页面 获取 列表数据
  return axios({
    url: "/inquiry/PurchaseRequestService/findRequestList",
    method: "post",
    data: {
      elsAccount,
      currentPage: page.currentPage,
      pageSize: page.pageSize,
      ...params
    }
  });
};
export const delData = (elsAccount, purchaseRequestItemVOs) => {
  // 采购申请管理页面 删除 数据
  return axios({
    url: "/inquiry/PurchaseRequestService/batchDeleteRequest",
    method: "post",
    data: {
      elsAccount,
      purchaseRequestItemVOs: [purchaseRequestItemVOs]
    }
  });
};
export const getDetailList = (elsAccount, purchaseRequestNumber) => {
  // 获取采购申请详情页面数据
  return axios({
    url: "/inquiry/PurchaseRequestService/findRequestDetail",
    method: "post",
    data: {
      elsAccount,
      purchaseRequestNumber
    }
  });
};

export const handleData = (elsAccount, purchaseRequestNumber, params, obj) => {
  // 采购申请详情页面 (行增加、修改与删除)
  return axios({
    url: "/inquiry/PurchaseRequestService/saveRequestInfo",
    method: "post",
    data: {
      ...obj,
      elsAccount,
      purchaseRequestNumber,
      addList: params.addList,
      updateList: params.updateList,
      deleteList: params.deleteList
    }
  });
};

// todo 预估单价
export const findPriceByMaterialNumber = (
  elsAccount,
  materialNumber,
  priceType
) => {
  return axios({
    url: "/inquiry/PurchaseInformationRecordService/findPriceByMaterialNumber",
    method: "post",
    data: {
      elsAccount,
      materialNumber,
      priceType
    }
  });
};

// 获取物料
export const queryMaterialList = (elsAccount, page, keyWord) => {
  return axios({
    url: baseUrl + "mainData/MaterialService/queryMaterialList",
    method: "post",
    data: {
      materialCategory3: "0",
      fbk6: "N",
      elsAccount,
      ...page,
      keyWord
    }
  });
};

// 获取采购人
export const findSubAccountByKeyWord = (elsAccount, page) => {
  return axios({
    url: baseUrl + "AccountService/findSubAccountByKeyWord",
    method: "post",
    data: {
      elsAccount,
      ...page
    }
  });
};

// 获取申请类型
export const getApplicationType = (elsAccount, params) => {
  return axios({
    url: baseUrl + "ElsSearchDictionaryService/findList",
    method: "post",
    data: {
      elsAccount,
      ...params
    }
  });
};

// 动态表头
export const getTablePageConfig = (elsAccount, typeCode) => {
  return axios({
    url: baseUrl + "ElsCommonService/findTablePageConfig",
    method: "post",
    data: {
      elsAccount,
      businessModule: "purchaseRequisitionConfig",
      typeCode,
      role: "purchase"
    }
  });
};
// 动态表体
export const findTableColumnConfig = (
  elsAccount,
  elsSubAccount,
  toElsAccount,
  tableCode
) => {
  return axios({
    url: baseUrl + "ElsCommonService/findTableColumnConfig",
    method: "post",
    data: {
      elsAccount,
      elsSubAccount,
      toElsAccount,
      tableCode
    }
  });
};

// 生成excel模板
export const generateExcel = (elsAccount, fbk30) => {
  return axios({
    url: "/inquiry/PurchaseRequestService/templateDownload",
    method: "post",
    data: {
      elsAccount,
      fbk30
    }
  });
};

// 上传文件
export const uploadServlet = (elsAccount, file) => {
  return axios({
    url: "http://192.168.0.176:8080/qqt-srm/servlet/UploadServlet",
    method: "post",
    headers: { "Content-Type": "multipart/form-data" },
    data: {
      elsAccount,
      file
    }
  });
};

// 业务单据转换
export const convertExecute = (
  elsAccount,
  businessElsAccount,
  receiveOrderType,
  inputParamJson
) => {
  return axios({
    url: baseUrl + "ElsConvertConfigService/convertExecute",
    method: "post",
    data: {
      elsAccount,
      businessElsAccount,
      receiveOrderType,
      inputParamJson,
      convertType: "materialToRequest",
      sourceOrderType: "default"
    }
  });
};
