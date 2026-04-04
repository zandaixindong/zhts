# 如何将本项目变成 iPhone App (Xcode 手册)

这个文件夹包含了可以直接导入 Xcode 的 Swift 代码。

### 第一步：新建 Xcode 项目
1. 打开 Xcode，选择 **Create a new Xcode project**。
2. 选择 **iOS** -> **App**。
3. 项目名称填写：`AILibrary`
4. Interface 选择 **SwiftUI**，Language 选择 **Swift**。

### 第二步：导入代码
1. 将本项目 `ios-app` 文件夹下的 `.swift` 文件拖入 Xcode 项目的左侧文件列表中。
2. 如果提示覆盖，请选择覆盖。

### 第三步：配置权限 (Info.plist)
为了让 AI 扫码功能生效，您需要在 `Info.plist` 中添加：
*   `Privacy - Camera Usage Description`: 我们需要相机权限来进行图书条码扫描和座位签到。

### 第四步：设置服务器地址
在 `ContentView.swift` 中，将 `url` 修改为您的 **Localtunnel 公网地址** 或 **局域网 IP**。

### 第五步：运行
连接 iPhone 或使用模拟器，点击 **Run** 按钮。您现在拥有了一个原生的 iPhone App！
