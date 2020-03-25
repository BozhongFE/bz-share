## 0.1.0

`new` 初始化分享模块

## 0.2.0
`new` 新增 wxReadyAppend 函数；
`new` 新增通用分享成功和分享取消函数；
`new` Object assgin 的 polyfill 改为 npm 安装 object-assgin 模块；
`new` 新增无依赖 UMD 文件；
`new` 新增QQ好友分享
`fix` 孕迹默认移除shareList的值，默认为空值，即可所有分享都有
`fix` 其他app需要配置全部值，即可所有分享都有，内置已配置
`fix` 默认协议头改为bzinner

## 0.2.1
`fix` 微信配置config被外部覆盖时，需要重新写入接口数据（即公众号签名）

## 0.3.1
`new` 提取按钮绑定分享的逻辑，供外部使用

## 0.3.2
`fix` 新增wechat.options.showMenuList配置，用于单页面应用中关闭分享后再次开启

## 0.3.3
`new` 参数 button 目前只支持a标签，现在也需要支持非 a 标签，同时，检查这个 button !== '#share'
`new` 检查页面是否出现两个以上的id为share的标签，有的话抛出错误提示
`new` 对微信分享jssdk接口请求授权信息做缓存
`new` 不重复对微信进行配置
`new` 微信分享使用的appId 改成读取公共配置 source/common/js/config.js

## 0.3.4
`fix` 无法重新覆盖微信配置