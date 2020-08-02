const popList = [
  {
    label: '验厂单',
    prop: 'inspectionAccess',
    url: '/admission/#/inspectTableAudit/detail/'
  },
  { label: '资质准入', prop: 'aptitudesAccess', url: '/admission/#/sampleAudit/view/' },
  { label: '样品准入', prop: 'auditAccess', url: '/admission/#/auditAdmission/view/' },
  {
    label: '物料',
    prop: 'materialNumber',
    url: '/masterdata/material/#/masterdata/view/',
    component: 'fast2-select-material',
    func: 'selectedRowMaterails',
    params: []
  },
  {
    label: '采购组',
    prop: 'purchaseGroup',
    url: '/masterdata/material/#/masterdata/view/',
    component: 'fast2-select-purchase-group',
    func: 'saveSelected',
    params: ['purchaseGroup', 'purchaseGroupDesc', 'orgId', 'orgDesc']
  },
  {
    label: '采购组',
    prop: 'purchaseGroupCode',
    url: '/masterdata/material/#/masterdata/view/',
    component: 'fast2-select-purchase-group',
    func: 'saveSelected',
    params: ['purchaseGroupCode', 'purchaseGroupDesc', 'orgId', 'orgDesc']
  },
  {
    label: '采购组织',
    prop: 'purchaseOrganization',
    url: '/masterdata/material/#/masterdata/view/',
    component: 'fast2-select-purchase-organization',
    func: 'saveSelected',
    params: ['purchaseOrganization', 'purchaseOrganizationDesc', 'orgId', 'orgDesc']
  },
  {
    label: '采购组织',
    prop: 'organizationCode',
    url: '/masterdata/material/#/masterdata/view/',
    component: 'fast2-select-purchase-organization',
    func: 'saveSelected',
    params: ['organizationCode', 'purchaseOrganizationDesc', 'orgId', 'orgDesc']
  },
  {
    label: '期望供应商',
    prop: 'expectSupplierEls',
    url: '/masterdata/material/#/masterdata/view/',
    component: 'fast2-select-supplier',
    func: 'saveSelected',
    params: ['expectSupplierEls', 'expectSupplierElsName', 'toElsAccount', 'toElsAccountName']
  },
  {
    label: '公司代码',
    prop: 'companyCode',
    url: '/masterdata/material/#/masterdata/view/',
    component: 'fast2-select-supplier',
    func: 'saveSelected',
    params: ['companyCode', 'companyCodeName', 'toElsAccount', 'toElsAccountName']
  },
  {
    label: '供应商',
    prop: 'toElsAccount',
    url: '/masterdata/material/#/masterdata/view/',
    component: 'fast2-select-supplier',
    func: 'saveSelected',
    params: ['toElsAccount', 'toElsAccountName', 'toElsAccount', 'toElsAccountName']
  },
  {
    label: '采购计划员',
    prop: 'purchasePlaner',
    url: '/masterdata/material/#/masterdata/view/',
    component: 'fast2-select-employee',
    func: 'saveSelected',
    params: ['purchasePlaner', 'purchasePlanerName', 'subElsAccount', 'name']
  },
  {
    label: '采购负责人',
    prop: 'purchasePerson',
    url: '/masterdata/material/#/masterdata/view/',
    component: 'fast2-select-employee',
    func: 'saveSelected',
    params: ['purchasePerson', 'purchasePersonName', 'subElsAccount', 'name']
  },
  {
    label: '采购负责人',
    prop: 'purchaseInCharge',
    url: '/masterdata/material/#/masterdata/view/',
    component: 'fast2-select-employee',
    func: 'saveSelected',
    params: ['purchaseInCharge', 'purchaseInChargeName', 'subElsAccount', 'name']
  },
  {
    label: '负责人',
    prop: 'principal',
    url: '/masterdata/material/#/masterdata/view/',
    component: 'fast2-select-employee',
    func: 'saveSelected',
    params: ['principal', 'principalName', 'subElsAccount', 'name']
  },
  {
    label: '采购工厂',
    prop: 'purchaseFactory',
    url: '/masterdata/material/#/masterdata/view/',
    component: 'fast2-select-factory',
    func: 'saveSelected',
    params: ['purchaseFactory', 'factoryName', 'orgId', 'orgDesc']
  },
  {
    label: '采购工厂',
    prop: 'factory',
    url: '/masterdata/material/#/masterdata/view/',
    component: 'fast2-select-factory',
    func: 'saveSelected',
    params: ['factory', 'factoryName', 'orgId', 'orgDesc']
  },
  {
    label: '送货通知订单',
    prop: 'orderNumber',
    url: '/order/#/view/',
    component: 'fast2-select-order',
    func: 'saveSelected',
    params: ['orderNumber', 'orderItemNumber', 'orderNumber', 'orderItemNumber']
  }
];
export default popList;
