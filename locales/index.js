import Vue from 'vue';
import VueI18n from 'vue-i18n';

Vue.use(VueI18n);

const DEFAULT_LANG = 'zh';
const LOCALE_KEY = 'localeLanguage';

const locales = {
  zh: require('./zh.json'),
  en: require('./en.json')
};

const i18n = new VueI18n({
  locale: DEFAULT_LANG,
  messages: locales
});

export const setup = (lang) => {
  if (lang === undefined) {
    lang = window.localStorage.getItem(LOCALE_KEY);
    if (locales[lang] === undefined) {
      lang = DEFAULT_LANG;
    }
  }
  window.localStorage.setItem(LOCALE_KEY, lang);
  let html = document.querySelector('html');
  Object.keys(locales).forEach((lang) => {
    html.classList.remove(`lang-${lang}`);
  });
  html.classList.add(`lang-${lang}`);
  html.setAttribute('lang', lang);
  Vue.config.lang = lang;
  i18n.locale = lang;
};

setup('zh');
window.$t = i18n;
export default i18n;
