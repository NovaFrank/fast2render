const permisssion = {
  'fullfield-acess': {
    fieldJson: [
      {
        prop: 'elsAccount',
        display: 'true'
      }
    ],
    tableJson: []
  },
  'fullfield-bank': {
    fieldJson: [
      {
        prop: 'elsAccount',
        display: 'true'
      },
      {
        prop: 'itemNumber',
        display: 'true'
      },
      {
        prop: 'bankCountry',
        display: 'true'
      },
      {
        prop: 'bankProvince',
        display: 'true'
      },
      {
        prop: 'bankCity',
        display: 'true'
      },
      {
        prop: 'bankBranchName',
        display: 'true'
      },
      {
        prop: 'bankAccount',
        display: 'true'
      }
    ],
    tableJson: []
  },
  'fullfield-certificated': {
    fieldJson: [],
    tableJson: [
      {
        prop: 'elsAccount',
        display: 'true'
      },
      {
        prop: 'toElsAccount',
        display: 'true'
      },
      {
        prop: 'itemNumber',
        display: 'true'
      },
      {
        prop: 'certificationType',
        span: 8,
        label: '认证类型'
      },
      {
        prop: 'certificationOrg',
        display: 'true'
      },
      {
        prop: 'certificationSta',
        display: 'true'
      },
      {
        prop: 'certificationName',
        display: 'true'
      },
      {
        prop: 'certificationNo',
        display: 'true'
      },
      {
        prop: 'certificationDate',
        display: 'true'
      },
      {
        prop: 'effectiveDate',
        display: 'true'
      },
      {
        prop: 'expiryDate',
        display: 'true'
      },
      {
        prop: 'fileName',
        display: 'true'
      },
      {
        prop: 'filePath',
        span: 8,
        label: '开户资料扫描件地址'
      },
      {
        prop: 'remark',
        display: 'true'
      },
      {
        prop: 'createDate',
        display: 'true',
        label: '创建时间'
      }
    ]
  }
};

export default permisssion;
