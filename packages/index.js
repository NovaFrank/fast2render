import Fast2Render from "./components/render/widget/fast2render.vue";
import ComponentRender from "./components/render/componentRender.vue";
import ButtonsRender from "./components/render/widget/render-button-group.vue";

export default {
  install(Vue) {
    Vue.component("Fast2" + Fast2Render.name, Fast2Render);
    Vue.component("Fast2" + ComponentRender.name, ComponentRender);
    Vue.component("Fast2" + ButtonsRender.name, ButtonsRender);
  }
};
