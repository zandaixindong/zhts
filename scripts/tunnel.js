/* global require, console, process */
const lt = require('localtunnel');
const qrcode = require('qrcode-terminal');

const FRONTEND_PORT = 5173;
const BACKEND_PORT = 3001;

async function startTunnels() {
  console.log('\n🚀 正在为 AI 图书馆启动双路内网穿透...\n');

  try {
    // 1. 穿透后端接口
    const backendTunnel = await lt({ port: BACKEND_PORT });
    console.log(`📡 后端 API 隧道已就绪: ${backendTunnel.url}`);

    // 2. 穿透前端界面
    const frontendTunnel = await lt({ port: FRONTEND_PORT });
    console.log(`📱 前端界面隧道已就绪: ${frontendTunnel.url}`);
    
    console.log('\n✨ [重要] 请在手机 App 或浏览器中访问前端 URL');
    console.log('✨ 系统已自动关联穿透后的 API 地址');
    console.log('\n🔗 点击或扫描下方二维码访问：');

    qrcode.generate(frontendTunnel.url, { small: true }, (qr) => {
      console.log(qr);
      console.log(`\nURL: ${frontendTunnel.url}\n`);
    });

    // 监听退出
    process.on('SIGINT', () => {
      backendTunnel.close();
      frontendTunnel.close();
      process.exit();
    });

  } catch (err) {
    console.error('❌ 隧道启动失败:', err);
  }
}

startTunnels();
