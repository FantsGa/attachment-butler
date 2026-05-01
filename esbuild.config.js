// ================================================================
// esbuild.config.js
// 修复：用 async IIFE 包装，解决 Node.js CommonJS 模式不支持顶层 await 的问题
// IIFE = Immediately Invoked Function Expression（立即执行的函数）
// ================================================================

const esbuild = require('esbuild');

const isDev = process.argv.includes('--dev');

// 用 (async () => { ... })() 包住所有 await，这是标准的兼容写法
(async () => {
  const context = await esbuild.context({
    entryPoints: ['src/main.js'],
    outfile: 'main.js',
    bundle: true,
    platform: 'node',
    external: ['obsidian', 'electron', 'fs', 'path', 'os'],
    minify: !isDev,
    sourcemap: isDev ? 'inline' : false,
  });

  if (isDev) {
    await context.watch();
    console.log('Attachment Butler: 开发模式已启动，监听文件变化中...');
  } else {
    await context.rebuild();
    await context.dispose();
    console.log('Attachment Butler: 生产打包完成');
  }
})();