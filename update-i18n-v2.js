/**
 * 自动更新 i18n-redirect.js 到 v2.0 版本
 * 修复语言切换时的控制台报错问题
 */

const fs = require('fs');
const path = require('path');

// 目标文件路径
const targetFile = path.join(__dirname, 'source', 'js', 'i18n-redirect.js');

// v2.0 版本的完整代码
const v2Code = `/**
 * 多语言自动检测与跳转脚本（增强版 v2.0）
 * 修复：点击语言切换时不再报错
 */

(function() {
  'use strict';

  try {
    var CONFIG = {
      languages: {
        'zh-CN': '/zh-CN/',
        'en': '/en/',
        'zh-TW': '/zh-TW/',
        'ja': '/ja/'
      },
      defaultLang: 'zh-CN',
      storageKey: 'user-language-preference',
      debugMode: location.hostname === 'localhost' || location.hostname === '127.0.0.1'
    };

    function log() {
      if (CONFIG.debugMode) {
        var args = [].slice.call(arguments);
        console.log.apply(console, ['[i18n]'].concat(args));
      }
    }

    function logError() {
      if (CONFIG.debugMode) {
        var args = [].slice.call(arguments);
        console.error.apply(console, ['[i18n Error]'].concat(args));
      }
    }

    function getCurrentPath() {
      try { return location.pathname || '/'; }
      catch (e) { logError('获取路径失败:', e); return '/'; }
    }

    function isLanguageSpecificPage(path) {
      if (!path) return false;
      return Object.values(CONFIG.languages).some(function(p) { return path.startsWith(p); });
    }

    function getBrowserLanguages() {
      try {
        if (navigator.languages && navigator.languages.length) return navigator.languages;
        if (navigator.language) return [navigator.language];
        if (navigator.userLanguage) return [navigator.userLanguage];
        return [];
      } catch (e) { logError('获取浏览器语言失败:', e); return []; }
    }

    function matchLanguage(browserLang) {
      if (!browserLang) return null;
      try {
        if (CONFIG.languages[browserLang]) return browserLang;
        var prefix = browserLang.split('-')[0];
        for (var lang in CONFIG.languages) {
          if (CONFIG.languages.hasOwnProperty(lang) && lang.indexOf(prefix) === 0) return lang;
        }
        return null;
      } catch (e) { logError('匹配失败:', e); return null; }
    }

    function detectBestLanguage() {
      try {
        var saved = getSavedLanguage();
        if (saved && CONFIG.languages[saved]) { log('使用保存的语言:', saved); return saved; }
        var browsers = getBrowserLanguages();
        for (var i = 0; i < browsers.length; i++) {
          var matched = matchLanguage(browsers[i]);
          if (matched) { log('匹配到:', browsers[i], '->', matched); return matched; }
        }
        log('使用默认语言:', CONFIG.defaultLang);
        return CONFIG.defaultLang;
      } catch (e) { logError('检测失败:', e); return CONFIG.defaultLang; }
    }

    function getSavedLanguage() {
      try {
        if (typeof localStorage === 'undefined' || !localStorage) return null;
        return localStorage.getItem(CONFIG.storageKey);
      } catch (e) { log('无法读取 localStorage'); return null; }
    }

    function saveLanguagePreference(lang) {
      try {
        if (!lang) return;
        if (typeof localStorage === 'undefined' || !localStorage) { log('localStorage 不可用'); return; }
        localStorage.setItem(CONFIG.storageKey, lang);
        log('已保存语言偏好:', lang);
      } catch (e) { log('保存失败:', e.message || e); }
    }

    function redirectToLanguage(targetLang) {
      try {
        if (!targetLang || !CONFIG.languages[targetLang]) { logError('无效语言:', targetLang); return; }
        var currentPath = getCurrentPath();
        var targetPath;
        if (isLanguageSpecificPage(currentPath)) {
          var prefix = null;
          var paths = Object.values(CONFIG.languages);
          for (var i = 0; i < paths.length; i++) {
            if (paths[i] && currentPath.startsWith(paths[i])) { prefix = paths[i]; break; }
          }
          targetPath = prefix ? currentPath.replace(prefix, CONFIG.languages[targetLang]) : CONFIG.languages[targetLang];
        } else {
          targetPath = CONFIG.languages[targetLang] || '/';
        }
        if (targetPath && targetPath !== currentPath) { log('跳转到:', targetPath); location.replace(targetPath); }
      } catch (e) { logError('跳转失败:', e); }
    }

    function initLanguageSwitcher() {
      try {
        var selectors = ['a[href="/zh-CN/"]', 'a[href="/en/"]', 'a[href^="/zh-CN/"]', 'a[href^="/en/"]'];
        var links = [];
        selectors.forEach(function(sel) {
          try {
            var found = document.querySelectorAll(sel);
            if (found && found.length) links = links.concat([].slice.call(found));
          } catch (err) { logError('选择器错误:', sel, err); }
        });
        links = links.filter(function(link, idx, self) { return self.indexOf(link) === idx; });
        if (!links.length) { log('未找到语言切换链接'); return; }
        log('找到', links.length, '个语言切换链接');
        links.forEach(function(link) {
          if (!link) return;
          link.addEventListener('click', function(e) {
            try {
              var href = link.getAttribute('href');
              if (!href) return;
              var match = href.match(/^\\/(zh-CN|en|zh-TW|ja)\\//);
              if (match && match[1]) { saveLanguagePreference(match[1]); log('用户选择:', match[1]); }
            } catch (err) { logError('点击处理错误:', err); }
          });
        });
      } catch (e) { logError('初始化切换器失败:', e); }
    }

    function performAutoRedirect() {
      try {
        var path = getCurrentPath();
        if (!isLanguageSpecificPage(path)) {
          var best = detectBestLanguage();
          log('自动检测:', best, '当前路径:', path);
          redirectToLanguage(best);
        } else { log('当前已在语言页面:', path); }
      } catch (e) { logError('自动跳转失败:', e); }
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        try { performAutoRedirect(); initLanguageSwitcher(); } catch (e) { logError('初始化失败:', e); }
      });
    } else {
      try { performAutoRedirect(); initLanguageSwitcher(); } catch (e) { logError('初始化失败:', e); }
    }

    window.i18nRedirect = {
      redirectToLanguage: function(l) { try { redirectToLanguage(l); } catch (e) { logError('调用失败:', e); } },
      saveLanguagePreference: function(l) { try { saveLanguagePreference(l); } catch (e) { logError('调用失败:', e); } },
      detectBestLanguage: function() { try { return detectBestLanguage(); } catch (e) { logError('调用失败:', e); return CONFIG.defaultLang; } },
      getConfig: function() { return CONFIG; }
    };

    log('多语言脚本 v2.0 初始化完成');
  } catch (globalError) {
    console.error('[i18n] 严重错误:', globalError);
  }
})();`;

console.log('🔄 正在更新 i18n-redirect.js 到 v2.0...');
console.log('📁 目标文件:', targetFile);

try {
  // 检查文件是否存在
  if (!fs.existsSync(targetFile)) {
    throw new Error('目标文件不存在: ' + targetFile);
  }

  // 备份原文件（可选）
  const backupFile = targetFile + '.backup';
  fs.copyFileSync(targetFile, backupFile);
  console.log('✅ 已创建备份:', backupFile);

  // 写入新代码
  fs.writeFileSync(targetFile, v2Code, 'utf8');
  
  console.log('');
  console.log('✅✅✅ 更新成功！✅✅✅');
  console.log('');
  console.log('📝 文件信息:');
  const stats = fs.statSync(targetFile);
  console.log('   - 文件大小:', (stats.size / 1024).toFixed(2), 'KB');
  console.log('   - 更新时间:', stats.mtime.toLocaleString());
  console.log('');
  console.log('🎯 下一步操作:');
  console.log('   1. 运行: npm run build');
  console.log('   2. 运行: npm run server');
  console.log('   3. 测试语言切换功能');
  console.log('');
  console.log('💡 如果需要恢复旧版本，备份文件位于:', backupFile);

} catch (err) {
  console.error('');
  console.error('❌ 更新失败！');
  console.error('   错误信息:', err.message);
  console.error('');
  console.error('💡 可能的解决方案:');
  console.error('   1. 检查文件路径是否正确');
  console.error('   2. 检查文件权限（是否有写入权限）');
  console.error('   3. 手动复制代码替换文件内容');
  process.exit(1);
}