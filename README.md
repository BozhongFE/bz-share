# bz-share
播种网分享模块

## 打包

```shell
npm run build
```

## 接口

### share(options)

**Arguments**

- `options` (Object)
  - `app` (Object)：必填，具体参考播种网 wiki 里面的 webShare 协议
  - `wechat` (Object)：可选，没有填写则不设置微信内分享
    - `sdk` (Object)：微信 JS-SDK 的 wx 对象。如果需要在微信内分享则必填，没填则默认不设置微信内分享。
    - `debug` (boolean)：可选，是否开启微信 JS-SDK 的 debug 模式
    - `appId` (string)：可选，用于授权的微信公众号 APP ID，注意字母大小写
    - `options` (Object)： 可选，以下配置请参考微信 JS-SDK 的对应配置项
      - `config` (Object)：参考 wx.config
        - `jsApiList` (Array) 参考 wx.config.jsApiList
      - `hideMenuList` (Array)：参考 wx.hideMenuItems.menuList
      - `messageShare` (Object)：参考 wx.onMenuShareAppMessage
      - `timelineShare` (Object)：参考 wx.onMenuShareTimeline
      - `wxReady` (Function)：参考 wx.ready 回调函数
      - `wxReadyAppend` (Function)：在 wxReady 最后执行的函数，v0.2.0 新增
      - `wxError` (Function)：参考 wx.error 回调函数
  - `protocol` (string)：可选，APP 协议头。**Default:** bzinner://
  - `button` (string)：可选，点击弹出分享的按钮，只能是a标签
  - `common` (Object)：可选，微信和 APP 通用函数
    - `success` (Function)：可选，通用分享成功函数
    - `cancel` (Function)：可选，通用分享取消函数

### setShareBtn(selector)

**Arguments**

- `selector` (String): 必填，点击弹出分享的按钮的选择器，需先执行share()后使用

**Example**

script 标签引用微信 JS-SDK
```html
<!-- 这种引用方式需要放在 require.js 之前 -->
<script src="https://res.wx.qq.com/open/js/jweixin-1.2.0.js"></script>
```

require.js 引用微信 JS-SDK，两种方式用任意一种即可。
```javascript
require(['https://res.wx.qq.com/open/js/jweixin-1.2.0.js'], function (wx) {
  // do something...
});
```

```javascript
var bzShare = require('bz-share');
bzShare.share({
  app: {
    type: 'webShare',
    // 默认全部分享时，不要配置此项
    //shareList: [
    //  'ShareTypeSinaWeibo',
    //  'ShareTypeQQSpace',
    //  'ShareTypeWeixinSession',
    //  'ShareTypeWeixinTimeline',
    //  'ShareTypeQQFriend',
    //],
    content: '内容',
    title: '标题',
    image: 'http://example.com/example.png',
    url: 'http://example.com',
    weixinSessionContent: '微信好友内容', 
    weixinSessionTitle: '微信好友标题', 
    weixinTimelineTitle: '朋友圈标题',
    bzWebviewBtn: '1100',
  },
  wechat: {
    sdk: wx,
    debug: true,
    appId: 'wx0066bzbzbzbzbz',
    options: {
      config: {},
      hideMenuList: [],
      messageShare: {},
      timelineShare: {},
      wxReadyAppend: function () {
        // append something...
      },
      wxReady: function() {
        // do something...
      },
      wxError: function () {
        // do something...
      },
    },
  },
  common: {
    success: function () {
      // do something...
    },
    cancel: function () {
      // do something...
    },
  },
  protocol: 'fkzr://',
  button: '.btn-share',
});
```

大多数情况下只需要这么写：
```javascript
var bzShare = require('bz-share');
bzShare.share({
  app: {
    content: '内容',
    title: '标题',
    image: 'http://example.com/example.png',
    url: 'http://example.com',
  },
  wechat: {
    sdk: wx,
  },
});
```

## Feature

* [x] 参数 `button` 目前只支持a标签，现在也需要支持非 a 标签，同时，检查这个 button !== '#share'
* [x] 检查页面是否出现两个以上的id为share的标签，有的话抛出错误提示
* [x] 对微信分享jssdk接口请求授权信息做缓存

## 微信

微信参考文档 https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421141115

## 原始调用方式与原理说明

https://github.com/BozhongFE/bz-share/wiki
