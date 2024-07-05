---
> ## ⚠️ 项目更新
>
> 该库的升级版请查看[strive-molu-axios](https://github.com/zhoubaos/strive-molu-axios).
> 
---

## 安装

```bash
npm install @strive_molu/fetch
```

## 介绍

基于axios进行封装的接口请求类，支持get，post，delete，put请求方法。同时支持接口请求错误自动重新请求，取消重复的接口请求，取消所有正在发送的请求。

## 构造函数参数

| 参数名称    | 类型     | 是否必填 | 描述             | 默认值        |
|---------|--------|------|----------------|------------|
| baseUrl | string | 否    | 全局的接口请求baseURL | /api       |
| timeout | number | 否    | 全局的接口超时参数，     | 10000（10s） |

**创建实例**

```typescript
import MoluFetch from '@strive_molu/fetch';

const baseUrl ='/api';
const moluFetch = new MoluFetch({
  baseUrl,
  timeout: 20000
});
```

## 实例方法

### request

接口请求方法。返回一个promise对象。

```javascript
import MoluFetch from '@strive_molu/fetch';

let moluFetch = new MoluFetch();

moluFetch.request({
  url: '/xxx',
  //其他参数配置
}).then((res) => {
  console.log('====success====', res);
}).catch((err) => {
  console.log('====error=====', err);
});
```

**请求参数**

| 参数名称                  | 类型    | 是否必填 | 描述                                                         | 默认值                                  |
| ------------------------- | ------- | -------- | ------------------------------------------------------------ | --------------------------------------- |
| url                       | string  | 是       | 请求路径                                                     |                                         |
| baseUrl                   | string  | 否       | baseUrl，在url为相对路径时加在url前面                        | 和构造函数的baseUrl相同                 |
| data                      | Object  | 否       | 请求传参                                                     |                                         |
| method                    | string  | 否       | 请求方法                                                     | get，可用值get \| post \| put \| delete |
| headers                   | Object  | 否       | 请求头                                                       |                                         |
| timeout                   | number  | 否       | 接口延时                                                     | 和构造函数timeout相同                   |
| retryTimes                | number  | 否       | 失败重传次数                                                 | 1                                       |
| contentType               | string  | 否       | 设置content-type的值 <br> urlencoded：application/x-www-form-urlencoded<br> json：application/json<br> formdata：multipart/formdata | urlencoded                              |
| isHandleSuccessReturnData | boolean | 否       | 是否处理接口请求成功返回数据，true 接口返回res.data；false 默认返回res，或者可以使用customSuccessHandle方法自定义返回数据 | true                                    |
| isHandleErrorReturnData   | boolean | 否       | 是否处理接口判断是否返回的错误信息，true返回格式如下；false 默认返回error，或者通过customErrorHandle方法自定义错误返回信息 | true                                    |
| isCancelRepeatRequest     | boolean | 否       | 是否取消重复请求。根据请求参数的method，url，params和data来判断是否重复。 | true                                    |

**isHandleErrorReturnData为true返回数据格式**

```typescript
{
    code:string | number; //接口错误的code字段，或接口成功后端返回的code字段
    message:string; //接口返回的错误信息
    errorText:string; //自定义返回错误信息
}
```

### cancelAllPendingRequest

用于全部取消正在请求的接口，一般用于在路由切换时，清除上一个页面的请求接口。

### customJudgeSuccess

自定义判断接口是否成功方法。

默认 **（res.info == 'Success' && res.status == 1）**判断接口成功，返回true。

当方法返回为false时，接口返回结果会被catch捕获。

```javascript
import MoluFetch from '@strive_molu/fetch';

let moluFetch = new MoluFetch();

/**
 * @function 自定义判断接口是否成功方法。
 * @param res 接口返回数据
 * @returns {Boolean} 返回 true/false
 */
moluFetch.customJudgeSuccess = (res) => {
  return true; //必须返回一个布尔值
};
```

### customSuccessHandle

请求成功处理方法。在请求参数`isHandleSuccessReturnData`属性为false时生效

```javascript
import MoluFetch from '@strive_molu/fetch';

let moluFetch = new MoluFetch();

/**
 * @function 自定义处理接口请求成功返回数据
 * @param res 接口返回数据
 * @param requestConfig 请求接口参数
 * @returns {any}
 */
moluFetch.customSuccessHandle = (res, requestConfig) => {
  return res.data;
};
```

### customErrorHandle

请求失败处理方法，在请求参数`isHandleErrorReturnData`属性为false时生效。

```javascript
import MoluFetch from '@strive_molu/fetch';

let moluFetch = new MoluFetch();
/**
 * @function 自定义处理接口请求失败返回数据
 * @param error 接口返回错误数据
 * @param requestConfig 请求接口参数
 * @returns {any}
 */
moluFetch.customErrorHandle = (error, requestConfig) => {
  return error;
};
```

### getSourceError

获取接口错误源信息。可以用于全局进行错误提示，上传错误日志。

```javascript
import MoluFetch from '@strive_molu/fetch';

let moluFetch = new MoluFetch();

/**
 * @function 获取错误信息
 * @param errorObj 错误信息对象
 *
 */
moluFetch.getSourceError = (error) => {
    // ......
}
```

### axiosRequestInterceptorsSuccess

发送请求之前做拦截器。通过下面方式重写

```typescript
import MoluFetch from '@strive_molu/fetch';

let moluFetch = new MoluFetch();

moluFetch.axiosRequestInterceptorsSuccess=(config)=>{
    //====编写逻辑====//
    return config; //必须返回config
}
```

### axiosRequestInterceptorsError

发生请求之前接口报错拦截器。通过下面方法重写

```typescript
import MoluFetch from '@strive_molu/fetch';

let moluFetch = new MoluFetch();

moluFetch.axiosRequestInterceptorsError=(error)=>{
    //====编写逻辑====//
    throw error; //必写
}
```

### axiosResponseInterceptorsSuccess

接口响应拦截器（状态码在2xx以内）。通过下面方法重写。

> 注意：如果你是想处理接口返回的数据，可以通过`customJudgeSuccess`或`customSuccessHandle`方法处理。

```typescript
import MoluFetch from '@strive_molu/fetch';

let moluFetch = new MoluFetch();

moluFetch.axiosResponseInterceptorsSuccess=(res)=>{
    //====编写逻辑====//
    return res; //必写
}
```

### axiosResponseInterceptorsError

接口响应拦截器（状态码在2xx以外）。通过下面方法重写。

```typescript
import MoluFetch from '@strive_molu/fetch';

let moluFetch = new MoluFetch();

moluFetch.axiosResponseInterceptorsError=(error)=>{
    //====编写逻辑====//
    throw error; //必写
}
```

## 例子

```typescript
import MoluFetch,{RequestOptions} from '@strive_molu/fetch';

const moluFetch = new MoluFetch({
  timeout: 20000
});

//自定义判断接口是否成功方法。如果不自定义该函数，默认通过 res.info == 'Success' && res.status == 1 判断成功
moluFetch.customJudgeSuccess = (res) => {
  return true;
};
// 自定义接口请求成功处理函数，isHandleReturnData 属性为false生效
moluFetch.customSuccessHandle = (res, requestConfig) => {
  return res.data.data;
};
// 自定义接口请求失败处理函数，可以用于上传日志，处理token失效等错误，只有在 isHandleReturnData 属性为false生效
moluFetch.customErrorHandle = (error) => {
  return error.data;
};
//  获取错误源信息（未经过任何处理的错误信息，错误可能是接口请求错误或者是接口请求成功，但不能通过 moluFetch.customSuccessHandle 方法校验返回的错误）
// 可以处理token失效，上传错误日志等错误
moluFetch.getSourceError = (error) => {
  //.....
}

export const request = <T = any>(requestOptions: RequestOptions): Promise<T> => {
  return moluFetch.request({
    //可以全局配置接口的一些参数，如下
    // isHandleSuccessReturnData: false,  //内部不处理接口成功返回的数据。
    // header:{}   //请求头设置一些token  
    ...requestOptions,
  });
};

```

