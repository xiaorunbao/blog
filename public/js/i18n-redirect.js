/**
 * 多语言自动检测与跳转脚本
 * Multilingual auto-detection and redirect script
 *
 * 功能：
 * 1. 检测浏览器语言设置
 * 2. 自动跳转到对应语言版本
 * 3. 支持手动切换并记住用户选择
 */

(function() {
  'use strict';

  // 支持的语言列表及其对应路径
  const LANGUAGES = {
    'zh-CN': '/zh-CN/',
    'en': '/en/',
    // 可在此添加更多语言
    'zh-TW': '/zh-TW/',
    'ja': '/ja/'
  };

  // 默认语言（当检测不到支持的语言时使用）
  const DEFAULT_LANG = 'zh-CN';

  // localStorage 中存储用户语言选择的 key
  const STORAGE_KEY = 'user-language-preference';

  /**
   * 获取当前 URL 的路径部分
   */
  function getCurrentPath() {
    return window.location.pathname;
  }

  /**
   * 检测当前页面是否已经是语言特定页面
   */
  function isLanguageSpecificPage(path) {
    return Object.values(LANGUAGES).some(langPath => path.startsWith(langPath));
  }

  /**
   * 获取浏览器的首选语言列表
   */
  function getBrowserLanguages() {
    // 优先使用 navigator.languages（现代浏览器）
    if (navigator.languages && navigator.languages.length > 0) {
      return navigator.languages;
    }
    // 回退到 navigator.language
    if (navigator.language) {
      return [navigator.language];
    }
    // 最后回退到 navigator.userLanguage（IE）
    if (navigator.userLanguage) {
      return [navigator.userLanguage];
    }
    return [];
  }

  /**
   * 匹配浏览器语言到支持的语言
   * 支持精确匹配和前缀匹配（如 "en-US" 匹配 "en"）
   */
  function matchLanguage(browserLang) {
    // 精确匹配（如 "zh-CN"）
    if (LANGUAGES[browserLang]) {
      return browserLang;
    }

    // 前缀匹配（如 "en-US" -> "en", "zh-TW" -> "zh-TW"）
    const langPrefix = browserLang.split('-')[0];
    for (const supportedLang of Object.keys(LANGUAGES)) {
      if (supportedLang.startsWith(langPrefix)) {
        return supportedLang;
      }
    }

    return null;
  }

  /**
   * 检测最佳语言
   */
  function detectBestLanguage() {
    // 1. 检查用户之前的手动选择
    const savedLang = localStorage.getItem(STORAGE_KEY);
    if (savedLang && LANGUAGES[savedLang]) {
      return savedLang;
    }

    // 2. 检查浏览器语言偏好
    const browserLanguages = getBrowserLanguages();
    for (const browserLang of browserLanguages) {
      const matched = matchLanguage(browserLang);
      if (matched) {
        return matched;
      }
    }

    // 3. 使用默认语言
    return DEFAULT_LANG;
  }

  /**
   * 跳转到指定语言版本
   */
  function redirectToLanguage(targetLang) {
    const currentPath = getCurrentPath();
    let targetPath;

    if (isLanguageSpecificPage(currentPath)) {
      // 当前已在语言特定页面，替换语言前缀
      const currentLangPrefix = Object.values(LANGUAGES).find(prefix => currentPath.startsWith(prefix));
      targetPath = currentPath.replace(currentLangPrefix, LANGUAGES[targetLang]);
    } else {
      // 当前在根路径，添加语言前缀
      targetPath = LANGUAGES[targetLang] || '/';
    }

    // 避免无限重定向
    if (targetPath !== currentPath) {
      window.location.replace(targetPath);
    }
  }

  /**
   * 保存用户的语言选择
   */
  function saveLanguagePreference(lang) {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {
      // localStorage 可能不可用（如隐私模式），忽略错误
      console.warn('无法保存语言偏好设置:', e);
    }
  }

  // 主逻辑：在 DOM 加载完成后执行
  document.addEventListener('DOMContentLoaded', function() {
    const currentPath = getCurrentPath();

    // 如果当前不在语言特定页面（如在根路径 "/"），则进行自动检测和跳转
    if (!isLanguageSpecificPage(currentPath)) {
      const bestLang = detectBestLanguage();
      redirectToLanguage(bestLang);
    }

    // 为语言切换按钮添加事件监听
    const langLinks = document.querySelectorAll('a[href^="/zh-CN/"], a[href^="/en/"]');
    langLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        // 从路径中提取语言代码
        const langMatch = href.match(/^\/(zh-CN|en|zh-TW|ja)\//);
        if (langMatch) {
          saveLanguagePreference(langMatch[1]);
        }
      });
    });
  });

  // 暴露全局函数供外部调用（可选）
  window.i18nRedirect = {
    redirectToLanguage,
    saveLanguagePreference,
    detectBestLanguage
  };

})();