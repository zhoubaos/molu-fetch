import MoluFetch from '../src/index';


const moluFetch = new MoluFetch({
  timeout: 20000
});

//自定义判断接口是否成功方法。默认 res.info == 'Success' && res.status == 1 判断成功
moluFetch.customSuccessHandle = (res) => {
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
//  获取错误源信息（未经过任何处理的错误信息）
moluFetch.getSourceError = (error) => {
  //.....
}

export const request = <T = any>(requestOptions): Promise<T> => {
  return moluFetch.request({
    //可以全局配置接口的一些参数，如下
    // isHandleSuccessReturnData: false,  //内部不处理接口成功返回的数据。
    // header:{}   //请求头设置一些token
    ...requestOptions,
  });
};
