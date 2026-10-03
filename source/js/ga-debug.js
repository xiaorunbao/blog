/**
 * Google Analytics 调试与验证工具
 * Google Analytics Debug & Verification Tool
 *
 * 功能：
 * 1. 检测 gtag.js 是否加载
 * 2. 验证 Measurement ID 是否正确
 * 3. 显示 dataLayer 中的事件
 * 4. 模拟事件发送（仅开发环境）
 *
 * 使用方法：
 * - 在浏览器控制台运行：gaDebug.check()
 * - 或访问任意页面后按 F12 查看控制台输出
 */

(function() {
  'use strict';

  // 配置：是否启用详细日志（生产环境应设为 false）
  const DEBUG_MODE = window.location.hostname === 'localhost' ||
                     window.location.hostname === '127.0.0.1';

  // GA4 Measurement ID（从配置中读取，这里仅作验证）
  const EXPECTED_GA_ID_PATTERN = /^G-[A-Z0-9]{10}$/;

  /**
   * 主调试对象
   */
  window.gaDebug = {
    /**
     * 运行完整检查
     */
    check: function() {
      console.log('%c🔍 Google Analytics 调试工具', 'font-size: 18px; font-weight: bold; color: #4285f4;');
      console.log('='.repeat(50));

      this.checkGtagLoaded();
      this.checkMeasurementId();
      this.checkDataLayer();
      this.checkTrackingRequests();
      this.showSummary();
    },

    /**
     * 检查 gtag.js 是否加载
     */
    checkGtagLoaded: function() {
      console.log('\n📦 检查 1: gtag.js 加载状态');

      if (typeof gtag === 'function') {
        console.log('✅ gtag 函数已定义');
        console.log('   gtag 类型:', typeof gtag);
      } else {
        console.log('❌ gtag 函数未找到');
        console.log('   可能原因：');
        console.log('   - Google Analytics 未启用');
        console.log('   - 脚本加载失败（网络问题）');
        console.log('   - 广告拦截器阻止了脚本');
      }
    },

    /**
     * 检查 Measurement ID
     */
    checkMeasurementId: function() {
      console.log('\n🔢 检查 2: Measurement ID');

      // 尝试从页面中提取 GA ID
      var gaScript = document.querySelector('script[src*="googletagmanager.com/gtag/js"]');
      
      if (gaScript) {
        var src = gaScript.getAttribute('src');
        var match = src.match(/[?&]id=([^&]+)/);
        
        if (match) {
          var gaId = match[1];
          console.log('✅ 找到 Measurement ID:', gaId);

          // 验证格式
          if (EXPECTED_GA_ID_PATTERN.test(gaId)) {
            console.log('✅ ID 格式正确 (GA4)');
          } else if (gaId.startsWith('UA-')) {
            console.log('⚠️  检测到旧版 Universal Analytics ID');
            console.log('   建议：迁移到 GA4 (G-XXXXXXXXXX)');
          } else {
            console.log('❓ 未知的 ID 格式');
          }
        }
      } else {
        console.log('❌ 未找到 Google Analytics 脚本标签');
        console.log('   请检查 _config.fluid.yml 中 web_analytics.gtag 配置');
      }

      // 检查 dataLayer 中的配置
      if (window.dataLayer && Array.isArray(window.dataLayer)) {
        var configEvent = window.dataLayer.find(function(item) {
          return item[0] === 'config';
        });

        if (configEvent) {
          console.log('\n📊 dataLayer 中的配置:');
          console.log('   config ID:', configEvent[1]);
          
          if (configEvent[2]) {
            console.log('   其他参数:', JSON.stringify(configEvent[2], null, 2));
          }
        }
      }
    },

    /**
     * 检查 dataLayer 事件
     */
    checkDataLayer: function() {
      console.log('\n📝 检查 3: dataLayer 事件记录');

      if (!window.dataLayer) {
        console.log('❌ dataLayer 未初始化');
        return;
      }

      console.log('📦 dataLayer中共有', window.dataLayer.length, '个事件:');
      
      window.dataLayer.forEach(function(event, index) {
        var eventName = event[0] || 'unknown';
        var preview = JSON.stringify(event).substring(0, 80) + '...';
        console.log('   [' + index + ']', eventName, '-', preview);
      });

      // 统计事件类型
      var eventTypes = {};
      window.dataLayer.forEach(function(event) {
        var name = event[0];
        eventTypes[name] = (eventTypes[name] || 0) + 1;
      });

      console.log('\n📈 事件类型统计:');
      Object.keys(eventTypes).forEach(function(type) {
        console.log('   ', type + ':', eventTypes[type], '次');
      });
    },

    /**
     * 检查网络请求（需要开发者工具 Network 标签配合）
     */
    checkTrackingRequests: function() {
      console.log('\n🌐 检查 4: 跟踪请求提示');
      console.log('💡 提示：请打开浏览器开发者工具的 Network 标签');
      console.log('   筛选条件输入: collect 或 www.google-analytics.com');
      console.log('   刷新页面后应该能看到发送到 Google 的请求');
      console.log('');
      console.log('   正常情况下会看到类似以下请求：');
      console.log('   - URL: https://www.google-analytics.com/g/collect?v=2&tid=G-XXX...');
      console.log('   - 方法: POST 或 GET');
      console.log('   - 状态码: 204 (成功)');
    },

    /**
     * 显示总结
     */
    showSummary: function() {
      console.log('\n' + '='.repeat(50));
      console.log('📋 总结:');
      console.log('-'.repeat(50));

      var hasGtag = typeof gtag === 'function';
      var hasDataLayer = !!window.dataLayer;
      var hasGaScript = !!document.querySelector('script[src*="googletagmanager.com"]');

      var allGood = hasGtag && hasDataLayer && hasGaScript;

      if (allGood) {
        console.log('%c✅ Google Analytics 配置正常！', 'color: green; font-weight: bold; font-size: 14px;');
        console.log('');
        console.log('🎉 下一步操作：');
        console.log('   1. 等待 24-48 小时');
        console.log('   2. 登录 https://analytics.google.com/');
        console.log('   3. 查看"实时"报告确认数据接收');
        console.log('   4. 探索其他报表了解访客行为');
      } else {
        console.log('%c⚠️  发现问题，请查看上方详细信息', 'color: orange; font-weight: bold; font-size: 14px;');
        console.log('');
        console.log('🔧 常见解决方案：');
        console.log('   1. 运行 hexo clean && npm run build 重新构建');
        console.log('   2. 检查 _config.fluid.yml 中 web_analytics 配置');
        console.log('   3. 确认 gtag 值为正确的 Measurement ID (G-XXXXX)');
        console.log('   4. 检查浏览器控制台是否有错误信息');
        console.log('   5. 禁用广告拦截器后重试');
      }

      console.log('\n💡 提示：在生产环境中，此调试工具不会输出任何内容');
      console.log('   如需生产环境调试，在控制台手动运行: gaDebug.check()');
    },

    /**
     * 发送测试事件（仅开发环境）
     */
    sendTestEvent: function() {
      if (!DEBUG_MODE) {
        console.warn('⚠️  测试事件仅在 localhost 环境下可发送');
        return;
      }

      if (typeof gtag !== 'function') {
        console.error('❌ gtag 未定义，无法发送测试事件');
        return;
      }

      console.log('🧪 发送测试事件...');

      gtag('event', 'debug_test', {
        'event_category': 'Debug',
        'event_label': 'GA Debug Tool Test',
        'value': 1,
        'non_interaction': true  // 不影响互动率统计
      });

      console.log('✅ 测试事件已发送');
      console.log('   事件名称: debug_test');
      console.log('   请在 GA 实时报告中查看是否收到');
    },

    /**
     * 清除所有日志（方便重新检查）
     */
    clearLogs: function() {
      console.clear();
      console.log('%c🧹 日志已清除', 'color: gray;');
      console.log('运行 gaDebug.check() 重新检查\n');
    }
  };

  // 自动运行检查（仅开发环境）
  if (DEBUG_MODE) {
    // 延迟执行，确保所有脚本加载完成
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        setTimeout(function() {
          window.gaDebug.check();
        }, 1000); // 延迟 1 秒确保 GA 脚本完全加载
      });
    } else {
      setTimeout(function() {
        window.gaDebug.check();
      }, 1000);
    }
  }

})();