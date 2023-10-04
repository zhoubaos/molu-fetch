module.exports = {
  printWidth: 120, //自动换行位置
  tabWidth: 2, // 缩进2个空格
  useTabs: false, // 缩进单位是否使用tab替代空格
  semi: true, // 句尾添加分号
  singleQuote: true, // 使用单引号代替双引号
  trailingComma: 'none', // 选项：none|es5|all， 在对象或数组最后一个元素后面是否加逗号
  arrowParens: 'always', //单参数箭头函数参数周围使用圆括号-eg: (x) => x
  singleAttributePerLine: true, // HTML、Vue 和 JSX 中有多个属性时，会触发换行
  bracketSameLine: true, // 处理singleAttributePerLine闭合标签也会独占一行问题
  singleAttributeLineIndent: true,
  endOfLine: 'auto' // 忽略lf和crlf校验
};
