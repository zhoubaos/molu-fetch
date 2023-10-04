## 介绍

基于axios进行封装的接口请求类，支持get，post，delete，put请求方法。同时支持接口请求错误自动重新请求，自动取消重复的接口请求。

## 构造函数参数

| 参数名称    | 类型     | 是否必填 | 描述             | 默认值        |
|---------|--------|------|----------------|------------|
| baseUrl | string | 否    | 全局的接口请求baseURL | /api       |
| timeout | number | 否    | 全局的接口超时参数，     | 10000（10s） |

## 实例方法

### request

接口请求方法。返回一个promise对象。

```javascript
import KjFetch from '@/utils/KjFetch';

let kjFetch = new KjFetch();

kjFetch.request({
  url: '/xxx',

}).then((res) => {
  console.log('====success====', res);
}).catch((err) => {
  console.log('====error=====', err);
});
```

**请求参数**

| 参数名称                  | 类型      | 是否必填 | 描述                                                                                                                           | 默认值                                 |
|-----------------------|---------|------|------------------------------------------------------------------------------------------------------------------------------|-------------------------------------|
| url                   | string  | 是    | 请求路径                                                                                                                         |                                     |
| baseUrl               | string  | 否    | baseUrl，在url为相对路径时加在url前面                                                                                                    | 和构造函数的baseUrl相同                     |
| data                  | Object  | 否    | 请求传参                                                                                                                         |                                     |
| method                | string  | 否    | 请求方法                                                                                                                         | get，可用值get \| post \| put \| delete |
| headers               | Object  | 否    | 请求头                                                                                                                          |                                     |
| timeout               | number  | 否    | 接口延时                                                                                                                         | 和构造函数timeout相同                      |
| retryTimes            | number  | 否    | 失败重传次数                                                                                                                       | 1                                   |
| contentType           | string  | 否    | 设置content-type的值 <br> urlencoded：application/x-www-form-urlencoded<br> json：application/json<br> formdata：multipart/formdata | urlencoded                          |
| isHandleReturnData    | boolean | 否    | 是否处理返回数据，true 接口返回res.data；false 接口返回res，或者可以使用customSuccessHandle \| customErrorHandle 方法自定义返回数据                            | true                                |
| isCancelRepeatRequest | boolean | 否    | 是否取消重复请求。根据请求参数的method，url，params和data来判断是否重复。                                                                               | true                                |

### cancelAllPendingRequest

用于全部取消正在请求的接口，一般用于在路由切换时，清除上一个页面的请求接口

### customJudgeSuccess

自定义判断接口是否成功方法。

默认 （res.info == 'Success' && res.status == 1）判断接口成功，返回true。

当方法返回为false时，接口返回结果会被catch捕获。

```javascript
import KjFetch from '@/utils/KjFetch';

let kjFetch = new KjFetch();

/**
 * @function 自定义判断接口是否成功方法。
 * @param res 接口返回数据
 * @returns {Boolean} 返回 true/false
 */
kjFetch.customJudgeSuccess = (res) => {
  return true;
};
```

### customSuccessHandle

请求成功处理方法。在请求参数`isHandleReturnData`属性为false时生效

```javascript
import KjFetch from '@/utils/KjFetch';

let kjFetch = new KjFetch();

/**
 * @function 自定义处理接口请求成功返回数据
 * @param res 接口返回数据
 * @param requestConfig 请求接口参数
 * @returns {any}
 */
kjFetch.customSuccessHandle = (res, requestConfig) => {
  return res.data;
};
```

### customErrorHandle

请求失败处理方法，可以用来上传错误日志。在请求参数`isHandleReturnData`属性为false时生效

```javascript
import KjFetch from '@/utils/KjFetch';

let kjFetch = new KjFetch();

/**
 * @function 自定义处理接口请求失败返回数据
 * @param error 接口返回错误数据
 * @param requestConfig 请求接口参数
 * @returns {any}
 */
kjFetch.customErrorHandle = (error, requestConfig) => {
  return error;
};
```
