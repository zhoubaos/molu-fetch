/**
 * @interface api请求参数配置
 */
export interface RequestOptions {
    url: string; //请求地址
    baseUrl?: string; //基础路由
    data?: any; //请求参数
    method?: 'get' | 'post' | 'put' | 'delete'; //请求方法
    headers?: any; //请求头
    timeout?: number; //请求超时
    retryTimes?: number; //请求次数，接口失败自动重新请求
    contentType?: 'json' | 'urlencoded' | 'formdata'; //请求内容编码
    isHandleReturnData?: boolean; //是否处理返回数据
    isCancelRepeatRequest?: boolean; // 是否取消重复请求（如果取消，会保留最开始那个请求，取消后面的重复请求）
}

/**
 * @interface 全局参数配置
 */
export interface GlobalConfig {
    baseUrl?: string;
    timeout?: number;
    // headers?: any;
}
