# Project Dev Background — chain-work

## 基本信息
- **仓库**: http://gitlab.alibaba-inc.com/channel-fe/chain-work.git
- **语言**: JavaScript (React + ICE)
- **类型**: 前端 Web 应用（1688 供应链工作台）
- **部署模型**: Aone 预发 + CDN 发布
- **预发地址**: https://pre-air.1688.com/app/channel-fe/chain-work/
- **正式地址**: https://work.1688.com/app/channel-fe/chain-work/

## 验证路径
- **类型**: cloud-service（CDN 前端，依赖后端 mtop 接口）
- **部署方式**: o2 迭代日常部署 → 预发验证 → 正式发布
- **验证边界**: 预发页面加载 + 功能可见性验证
- **本地验证**: 非必须（前端 CDN 应用，预发即终态验证环境）

## 页面路由
- `aeorder.html` → src/pages/AeOrder（速卖通订单管理主页面）
- `aliexpress.html` → src/pages/AliExpress（速卖通工作台，内嵌订单列表）
- `aecreateorder.html` → src/pages/AeCreateOrder（创建揽收单）

## 技术栈
- React 16+
- @alifd/next (Fusion Design)
- ICE 框架
- mtop 接口层 (@ali/universal-mtop)
- antd 5.x (部分页面)
