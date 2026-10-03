/**
 * SEO 多语言优化脚本
 * SEO Multilingual Optimization Script
 *
 * 功能：
 * 1. 自动生成 hreflang 标签（帮助搜索引擎理解多语言版本）
 * 2. 设置 <html lang="..."> 属性
 * 3. 添加 Open Graph 语言标签
 */

(function() {
  'use strict';

  // 多语言站点配置
  const I18N_CONFIG = {
    // 基础 URL（会自动替换为当前域名）
    baseUrl: window.location.origin,

    // 支持的语言及其路径
    languages: {
      'zh-CN': '/zh-CN/',
      'en': '/en/'
      // 可在此添加更多语言
      // 'zh-TW': '/zh-TW/',
      // 'ja': '/ja/'
    },

    // 默认语言
    defaultLanguage: 'zh-CN'
  };

  /**
   * 获取当前页面的语言
   */
  function getCurrentLanguage() {
    const path = window.location.pathname;

    for (const [lang, langPath] of Object.entries(I18N_CONFIG.languages)) {
      if (path.startsWith(langPath)) {
        return lang;
      }
    }

    // 如果没有匹配到，返回默认语言
    return I18N_CONFIG.defaultLanguage;
  }

  /**
   * 获取当前页面的相对路径（去除语言前缀）
   */
  function getPathWithoutLang(path) {
    for (const langPath of Object.values(I18N_CONFIG.languages)) {
      if (path.startsWith(langPath)) {
        return path.substring(langPath.length - 1); // 保留开头的 "/"
      }
    }
    return path;
  }

  /**
   * 生成指定语言的完整 URL
   */
  function generateUrlForLang(lang, currentPath) {
    const pathWithoutLang = getPathWithoutLang(currentPath);
    const langPath = I18N_CONFIG.languages[lang];
    return I18N_CONFIG.baseUrl + langPath + (pathWithoutLang === '/' ? '' : pathWithoutLang);
  }

  /**
   * 创建 hreflang 标签
   */
  function createHrefLangTag(href, hreflang) {
    const link = document.createElement('link');
    link.rel = 'alternate';
    link.hreflang = hreflang;
    link.href = href;
    return link;
  }

  /**
   * 添加 hreflang 标签到 <head>
   */
  function addHrefLangTags() {
    const currentPath = window.location.pathname;
    const currentLang = getCurrentLanguage();

    // 为每种支持的语言生成 hreflang 标签
    for (const lang of Object.keys(I18N_CONFIG.languages)) {
      const url = generateUrlForLang(lang, currentPath);
      const linkTag = createHrefLangTag(url, lang);
      document.head.appendChild(linkTag);
    }

    // 添加 x-default 标签（指向默认语言版本）
    const defaultUrl = generateUrlForLang(I18N_CONFIG.defaultLanguage, currentPath);
    const xDefaultTag = createHrefLangTag(defaultUrl, 'x-default');
    document.head.appendChild(xDefaultTag);
  }

  /**
   * 设置 <html> 标签的 lang 属性
   */
  function setHtmlLangAttribute() {
    const currentLang = getCurrentLanguage();
    document.documentElement.lang = currentLang;
  }

  /**
   * 添加 Open Graph 语言标签（用于社交媒体分享）
   */
  function addOpenGraphLangTags() {
    const currentLang = getCurrentLanguage();
    const ogLocaleMap = {
      'zh-CN': 'zh_CN',
      'en': 'en_US',
      'zh-TW': 'zh_TW',
      'ja': 'ja_JP'
    };

    const ogLocale = ogLocaleMap[currentLang] || currentLang;

    // 查找或创建 og:locale 标签
    let ogLocaleTag = document.querySelector('meta[property="og:locale"]');
    if (!ogLocaleTag) {
      ogLocaleTag = document.createElement('meta');
      ogLocaleTag.setAttribute('property', 'og:locale');
      document.head.appendChild(ogLocaleTag);
    }
    ogLocaleTag.content = ogLocale;

    // 为其他语言添加 og:locale:alternate 标签
    for (const lang of Object.keys(I18N_CONFIG.languages)) {
      if (lang !== currentLang) {
        const alternateLocale = ogLocaleMap[lang] || lang;
        let alternateTag = document.querySelector(`meta[property="og:locale:alternate"][content="${alternateLocale}"]`);

        if (!alternateTag) {
          alternateTag = document.createElement('meta');
          alternateTag.setAttribute('property', 'og:locale:alternate');
          alternateTag.content = alternateLocale;
          document.head.appendChild(alternateTag);
        }
      }
    }
  }

  /**
   * 主函数：执行所有 SEO 优化
   */
  function initSEO() {
    // 1. 设置 html lang 属性
    setHtmlLangAttribute();

    // 2. 添加 hreflang 标签
    addHrefLangTags();

    // 3. 添加 Open Graph 语言标签
    addOpenGraphLangTags();

    // 控制台输出调试信息（生产环境可删除）
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.log('[SEO I18n] 当前语言:', getCurrentLanguage());
      console.log('[SEO I18n] hreflang 标签已添加');
      console.log('[SEO I18n] Open Graph 语言标签已添加');
    }
  }

  // DOM 加载完成后执行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSEO);
  } else {
    // DOM 已经加载完成（脚本在底部加载时可能发生）
    initSEO();
  }

})();