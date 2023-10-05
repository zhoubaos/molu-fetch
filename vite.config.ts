import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({
      rollupTypes: true,
      copyDtsFiles: true
    })
  ],
  build: {
    outDir: 'lib', // 自定义构建输出目录
    lib: {
      entry: resolve(__dirname, './src'), // 入口文件路径
      name: 'molu', //暴露的全局变量，在formats为umd和iife模式下必须
      fileName: 'index', //输出包文件名默认和 package.json name属性相同
      formats: ['es', 'cjs', 'iife'] //打包模块格式 iife---打包为立即执行函数
    },
    rollupOptions: {},
    minify: false
  }
});
