<template>
  <div class="arrow-card">
    <div class="content">
      <div class="start-company mr16">
        {{ form.startCompanyName }}
      </div>
      <div class="info">
        <div class="percent">入股：{{ form.percent }}</div>
        <div class="arrow">
          <div></div>
          <div></div>
        </div>
        <div class="capital">资金：{{ form.regCapital }}</div>
      </div>
      <div class="end-company ml16">
        {{ form.endCompanyName }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    form: {
      type: Object,
      default: () => {}
    }
  }
};
</script>

<style lang="scss" scoped>
.arrow-card {
  display: inline-block;
  .content {
    display: flex;
    align-items: center;
    border: 1px solid #e4eef6;
    padding: 8px 15px;
    border-radius: 3px;
    &:hover {
      box-shadow: 1px 1px 4px #eee;
    }
    .start-company,
    .end-company {
      font-size: 14px;
    }
    .start-company {
      text-align: right;
    }
    .end-company {
      text-align: left;
    }
    .info {
      text-align: center;
      font-size: 12px;
      color: #666;

      .percent {
      }
      .arrow {
        display: flex;
        align-items: center;

        div:first-child {
          width: 100%;
          min-width: 150px;
          height: 3px;
          background-color: red;
        }
        div:last-child {
          border-top: 5px solid transparent;
          border-left: 24px solid red;
          border-bottom: 5px solid transparent;
        }
      }
      .capital {
      }
    }
  }
}
</style>
