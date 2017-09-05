import '../lib/polyfill';

const appReg = /bz-([A-Za-z]{1,50})-(android|ios)/;
const wechatReg = /micromessenger/i;

function getLink(prefix, productPrefix) {
  const host = window.location.host;
  const prodPrefix = productPrefix || prefix;

  if (host.indexOf('office') !== -1) {
    return `//${prefix}.office.bzdev.net`;
  } else if (host.indexOf('online') !== -1) {
    return `//${prefix}.online.seedit.cc`;
  }
  return `//${prodPrefix}.bozhong.com`;
}

// 创建一个 jsonp 请求
function jsonp(url, callback) {
  const callbackName = `jsonp_${Date.now()}`;
  const headEl = document.getElementsByTagName('head')[0];
  const script = document.createElement('script');
  const scriptUrl = `${url}&__c=${callbackName}`;
  script.src = scriptUrl;
  headEl.appendChild(script);

  window[callbackName] = function success(json) {
    typeof callback === 'function' && callback(json);
    headEl.removeChild(script);
    window[callbackName] = null;
  };
}

function appShare(options) {
  const opts = options;
  let shareEl = document.getElementById('share');

  if (!shareEl) {
    const shareDiv = document.createElement('div');
    shareDiv.setAttribute('id', 'share');
    document.querySelector('body').appendChild(shareDiv);
    shareEl = document.getElementById('share');
  }
  shareEl.style.display = 'none';

  const defaultOptions = {
    type: 'webShare',
    shareList: [
      'ShareTypeSinaWeibo',
      'ShareTypeQQSpace',
      'ShareTypeWeixinSession',
      'ShareTypeWeixinTimeline',
    ],
  };
  const appOptions = opts.app;
  const shareOptions = Object.assign(defaultOptions, appOptions);
  const scheme = encodeURIComponent(JSON.stringify(shareOptions));
  shareEl.textContent = scheme;

  // 如果设置了分享按钮
  if (opts.button) {
    const btnEl = document.querySelectorAll(options.button);
    if (btnEl.length > 0) {
      for (let i = 0; i < btnEl.length; i += 1) {
        btnEl[i].href = opts.protocol + scheme;
      }
    }
  }
}

function wechatShare(options) {
  const opts = options;
  const appOptions = opts.app;
  const wxOptions = opts.wechat;
  const wx = wxOptions.sdk;
  const appId = wxOptions.appId ? wxOptions.appId : 'wx06297e68f1f987bd'; // 默认使用「要个宝宝」的 APP ID
  const apiUrl = `${getLink('huodong')}/restful/weixin/tool.jsonp?type=4&service_appid=${appId}&url=${encodeURIComponent(window.location.href.split('#')[0])}`;

  jsonp(apiUrl, (data) => {
    let wxConfig = {
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
          'getNetworkType',
        ],
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
        'menuItem:readMode',
      ],
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
      wxReady() {
        // 分享给朋友
        wx.onMenuShareAppMessage(wxConfig.messageShare);

        // 分享到朋友圈
        wx.onMenuShareTimeline(wxConfig.timelineShare);

        // 隐藏微信右上角菜单列表
        wx.hideMenuItems({
          menuList: wxConfig.hideMenuList,
        });
      },
      wxError(res) {
        console.log(res);
      },
      init() {
        wxConfig = Object.assign(wxConfig, wxOptions.options);

        if (wxOptions.debug) {
          wxConfig.config.debug = wxOptions.debug;
        }

        wx.config(wxConfig.config);
        wx.ready(wxConfig.wxReady);
        wx.error(wxConfig.wxError);
      },
    };

    wxConfig.init();
  });
}

function share(options) {
  const ua = window.navigator.userAgent;
  const isApp = appReg.test(ua);
  const isWechat = wechatReg.test(ua);
  const opts = options;
  const protocol = 'fkzr://'; // 默认协议头

  if (!opts.protocol) {
    opts.protocol = protocol;
  }

  if (isApp) {
    appShare(opts);
  } else if (isWechat && opts.wechat && opts.wechat.sdk) {
    wechatShare(opts);
  }
}

export default {
  share,
};
