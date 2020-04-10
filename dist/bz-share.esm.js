import ObjectAssign from 'object-assign';

Object.assign = ObjectAssign;

var appReg = /bz-([A-Za-z]{1,50})-(android|ios)/;
var wechatReg = /micromessenger/i;
(function getBzConfig() {
  if (!window.bzConfig) {
    var url = (getLink('source')) + "/common/js/config.js";
    var script = document.createElement('script');
    script.src = url;
    document.body.appendChild(script);
  }
})();
function getLink(prefix, productPrefix) {
  var host = window.location.host;
  var prodPrefix = productPrefix || prefix;

  if (host.indexOf('office') !== -1) {
    return ("//" + prefix + ".office.bzdev.net");
  } else if (host.indexOf('online') !== -1) {
    return ("//" + prefix + ".online.seedit.cc");
  }
  return ("//" + prodPrefix + ".bozhong.com");
}

// 判断是否是函数
function isFunc(functionName) {
  return typeof functionName === 'function';
}

// 创建一个 jsonp 请求
function jsonp(url, callback) {
  var callbackName = "jsonp_" + (Date.now());
  var headEl = document.getElementsByTagName('head')[0];
  var script = document.createElement('script');
  var scriptUrl = url + "&__c=" + callbackName;
  script.src = scriptUrl;
  headEl.appendChild(script);

  window[callbackName] = function success(json) {
    typeof callback === 'function' && callback(json);
    headEl.removeChild(script);
    window[callbackName] = null;
  };
}

function appCallback(successCB, cancelCB) {
  if (successCB || cancelCB) {
    window.setShareStatus = function (status) {
      if (status === 0) {
        if (isFunc(successCB)) {
          successCB();
        }
      } else if (isFunc(cancelCB)) {
        cancelCB();
      }
    };
  }
}

var opts;
// 设置分享按钮，动态渲染的按钮请直接调用方法
function setShareBtn(selector) {
  var btnEl = document.querySelectorAll(selector);
  for (var i = 0; i < btnEl.length; i += 1) {
    var element = btnEl[i];
    if (element.getAttribute('id') === 'share') { continue; }
    if (element.tagName.toLocaleLowerCase() === 'a') {
      btnEl[i].href = opts.protocol + opts.scheme;
      continue;
    }
    (function(element) {
      element.onclick = function () {
        window.location.href = 'bzinner://' + encodeURIComponent(JSON.stringify(opts.app));
      };
    })(element);
  }
}

function appShare(options) {
  if (document.querySelectorAll('#share').length > 1) { throw new Error('出现两个及以上的id为share的标签'); }
  var opts = options;
  var shareEl = document.getElementById('share');

  if (!shareEl) {
    var shareDiv = document.createElement('div');
    shareDiv.setAttribute('id', 'share');
    document.querySelector('body').appendChild(shareDiv);
    shareEl = document.getElementById('share');
  }
  shareEl.style.display = 'none';
  var ua = window.navigator.userAgent;
  var defaultOptions = {
    type: 'webShare',
    // 兼容android孕迹，新增qq时不能分享，/bz-tracker-(android|ios)/.test(ua)
    shareList: /bz-tracker-(android|ios)/.test(ua) ? [] : [
      // 默认全部分享时，不要配置
      'ShareTypeSinaWeibo',
      'ShareTypeQQSpace',
      'ShareTypeWeixinSession',
      'ShareTypeWeixinTimeline',
      'ShareTypeQQFriend' ],
  };
  var appOptions = opts.app;
  var shareOptions = Object.assign(defaultOptions, appOptions);
  opts.scheme = encodeURIComponent(JSON.stringify(shareOptions));
  shareEl.textContent = opts.scheme;

  // 如果设置了分享按钮
  if (opts.button) { setShareBtn(opts.button); }

  if (opts.common) {
    appCallback(opts.common.success, opts.common.cancel);
  }
}
var jsdRequestData = null;

function wechatShare(options) {
  var opts = options;
  var wxOptions = opts.wechat;
  var appId = wxOptions.appId || (window.bzConfig && window.bzConfig.wechatId) || 'wx94d275603a55a2d8'; // 默认使用「要个宝宝」的 APP ID
  var apiUrl = (getLink('huodong')) + "/restful/weixin/tool.jsonp?type=4&service_appid=" + appId + "&url=" + (encodeURIComponent(window.location.href.split('#')[0]));

  if (!jsdRequestData) {
    jsonp(apiUrl, function (data) {
      jsdRequestData = data;
      var wxConfig = setWechatConfig(data, opts);
      wxConfig.init();
    });
  } else {
    var wxConfig = setWechatConfig(jsdRequestData, opts);
    wxConfig.init();
  }
}

function setWechatConfig(data, opts) {
  var appOptions = opts.app;
  var wxOptions = opts.wechat;
  var wx = wxOptions.sdk;
  var wxConfig = {
    config: {
      debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
      appId: data.data.appid, // 必填，企业号的唯一标识，此处填写企业号corpid
      timestamp: data.data.timestamp, // 必填，生成签名的时间戳
      nonceStr: data.data.noncestr, // 必填，生成签名的随机串
      signature: data.data.signature, // 必填，签名，见附录1
      jsApiList: [
        'onMenuShareTimeline',
        'onMenuShareAppMessage',
        'hideOptionMenu',
        'showOptionMenu',
        'hideMenuItems',
        'showMenuItems',
        'getNetworkType' ],
    },
    hideMenuList: [
      'menuItem:favorite',
      'menuItem:share:facebook',
      'menuItem:share:QZone',
      'menuItem:share:weiboApp',
      'menuItem:share:QZone',
      'menuItem:share:qq',
      'menuItem:copyUrl',
      'menuItem:openWithQQBrowser',
      'menuItem:openWithSafari',
      'menuItem:share:email',
      'menuItem:share:brand',
      'menuItem:editTag',
      'menuItem:setFont',
      'menuItem:readMode' ],
    messageShare: {
      title: appOptions.weixinSessionTitle || appOptions.title || '', // 分享标题
      desc: appOptions.weixinSessionContent || appOptions.content || '', // 分享摘要
      link: appOptions.weixinSessionUrl || appOptions.url || '', // 分享链接
      imgUrl: appOptions.weixinSessionImage || appOptions.image || '', // 分享图标
    },
    timelineShare: {
      title: appOptions.weixinTimelineTitle || appOptions.title || '',
      link: appOptions.weixinTimelineUrl || appOptions.url || '',
      imgUrl: appOptions.weixinTimelineImage || appOptions.image || '',
    },
    wxReadyAppend: function wxReadyAppend() {
      // 默认为空
    },
    wxReady: function wxReady() {
      // 分享给朋友
      wx.onMenuShareAppMessage(wxConfig.messageShare);

      // 分享到朋友圈
      wx.onMenuShareTimeline(wxConfig.timelineShare);

      // 显示微信右上角菜单列表（避免单页面应用中多次调用）
      if (wxConfig.showMenuList) {
        wx.showOptionMenu({
          menuList: wxConfig.showMenuList,
        });
      }

      // 隐藏微信右上角菜单列表
      wx.hideMenuItems({
        menuList: wxConfig.hideMenuList,
      });

      wxConfig.wxReadyAppend();
    },
    wxError: function wxError(res) {
      console.log(res);
    },
    initApiConfig: function initApiConfig() {
      wxConfig.config = Object.assign(wxConfig.config, {
        appId: data.data.appid, // 必填，企业号的唯一标识，此处填写企业号corpid
        timestamp: data.data.timestamp, // 必填，生成签名的时间戳
        nonceStr: data.data.noncestr, // 必填，生成签名的随机串
        signature: data.data.signature, // 必填，签名，见附录1
      });
    },
    init: function init() {
      wxConfig = Object.assign(wxConfig, wxOptions.options);
      // 上一个步骤覆盖config后，需要重新写入接口数据
      wxConfig.initApiConfig();

      if (wxOptions.debug) {
        wxConfig.config.debug = wxOptions.debug;
      }

      // 判断是否存在公共函数
      if (opts.common) {
        if (isFunc(opts.common.success)) {
          if (!wxConfig.messageShare.success) {
            wxConfig.messageShare.success = opts.common.success;
          }

          if (!wxConfig.timelineShare.success) {
            wxConfig.timelineShare.success = opts.common.success;
          }
        }

        if (isFunc(opts.common.cancel)) {
          if (!wxConfig.messageShare.cancel) {
            wxConfig.messageShare.cancel = opts.common.cancel;
          }

          if (!wxConfig.timelineShare.cancel) {
            wxConfig.timelineShare.cancel = opts.common.cancel;
          }
        }
      }

      wx.config(wxConfig.config);
      wx.ready(wxConfig.wxReady);
      wx.error(wxConfig.wxError);
    }
  };
  return wxConfig;
}

function share(options) {
  var ua = window.navigator.userAgent;
  var isApp = appReg.test(ua);
  var isWechat = wechatReg.test(ua);
  opts = options;
  var protocol = 'bzinner://'; // 默认协议头

  if (!opts.protocol) {
    opts.protocol = protocol;
  }

  if (isApp) {
    appShare(opts);
  } else if (isWechat && opts.wechat && opts.wechat.sdk) {
    wechatShare(opts);
  }
}


var index = {
  share: share,
  setShareBtn: setShareBtn,
};

export default index;
