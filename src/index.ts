import axios, {type AxiosInstance, AxiosRequestConfig, AxiosError} from 'axios';
import RequestPool from './requestPool';
import {type GlobalConfig, RequestOptions} from './types';

const CancelToken = axios.CancelToken;
/**
 * @constant 请求头content-type 映射
 */
const CONTENT_TYPE_REFLECT = {
    urlencoded: {'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'},
    json: {'Content-Type': 'application/json;charset=UTF-8'},
    formdata: {'Content-Type': 'multipart/formdata'}
};

/**
 * @constant 支持的请求方法
 */
const SUPPORT_METHOD = ['get', 'post', 'put', 'delete'];

class MoluFetch {
    globalBaseUrl: string = '/api';
    globalTimeout: number = 20000; //接口超时
    private _defaultReqOptions = {
        method: 'get',
        retryTimes: 1,
        contentType: 'urlencoded',
        isHandleReturnData: true,
        isHandleErrorReturnData: true,
        isCancelRepeatRequest: true
    };
    private _instance: AxiosInstance | null = null; //axios实例
    private _requestPool: RequestPool = new RequestPool(); //api请求池

    constructor(globalConfig?: GlobalConfig) {
        globalConfig && this._initializaGlobalConfig(globalConfig); //初始化全局配置参数
        this._initializaAxios();
    }

    /**
     * @function 对外暴露请求方法
     */
    request(requestOptions: RequestOptions) {
        const mergeOptions = this._getMergeRequestOptions(requestOptions) as Required<RequestOptions>; //合并请求配置
        const reqParamterConfig = this._getRequestParameter(mergeOptions); //获取api请求参数
        const {isRepeat, token} = this._requestPool.addRequest(reqParamterConfig, CancelToken);
        // 如果isCancelRepeatRequest为true，且接口重复
        if (mergeOptions.isCancelRepeatRequest && isRepeat) {
            return Promise.reject({message: '重复请求'});
        } else {
            reqParamterConfig.cancelToken = token; //给没给请求设置token，用于随时取消请求
        }
        // console.log('===合并配置===', mergeOptions);
        // console.log('===请求参数===', reqParamterConfig);

        const {retryTimes, isHandleSuccessReturnData, isHandleErrorReturnData} = mergeOptions;
        return this._request(reqParamterConfig, retryTimes, isHandleSuccessReturnData, isHandleErrorReturnData);
    }

    /**
     * @function 取消全部正在请求的接口
     */
    cancelAllPendingRequest() {
        this._requestPool.cancelAllRequest();
    }

    /**
     * @function 自定义接口请求成功处理函数
     */
    customSuccessHandle(res, requestConfig) {
        return res;
    }

    /**
     * @function 自定义接口请求失败处理函数
     */
    customErrorHandle(error, requestConfig) {
        return error;
    }

    /**
     * @function 自定义接口成功判断
     * @param res
     */
    customJudgeSuccess(result): boolean {
        return result.info == 'Success' && result.status == 1;

    }

    /**
     * @function 获取错误源信息
     * @param error
     */
    getSourceError(error:any){

    }

    // custom
    /**
     * @function axios请求方法
     */
    private _request(requestConfig: AxiosRequestConfig, retryTimes: number, isHandleSuccessReturnData: boolean, isHandleErrorReturnData: boolean) {
        retryTimes--;
        return (this._instance as AxiosInstance)
            .request({...requestConfig})
            .then((res) => {
                if (this.customJudgeSuccess(res.data)) {
                    return this._handleSuccessFn(res, requestConfig, isHandleSuccessReturnData);
                } else {
                    throw res;
                }
            })
            .catch((error) => {
                if (retryTimes >= 1) {
                    return this._request(requestConfig, retryTimes, isHandleSuccessReturnData, isHandleErrorReturnData);
                }
                throw this._handleErrorFn(error, requestConfig, isHandleErrorReturnData);
            })
            .finally(() => {
                this._requestPool.removefinishRequest(requestConfig);
            });
    }

    /**
     * @function 处理请求成功参数
     */
    private _handleSuccessFn(res, requestConfig, isHandleReturnData) {
        if (isHandleReturnData) {
            return res.data;
        } else {
            return this.customSuccessHandle(res, requestConfig) ?? res;
        }
    }

    /**
     * @function 处理请求失败错误函数
     * @param error 返回错误信息
     * @param requestConfig 接口请求参数
     * @param isHandleReturnData 是否处理返回错误数据
     * @private
     */
    private _handleErrorFn(error, requestConfig, isHandleReturnData) {
        this.getSourceError(error);
        let errorObj:any | null=null;
        if (isHandleReturnData) {
            const {codeError, message} = error; //接口请求失败，如超时，接口报错等错误
            const {msg, info,code} = error.data ?? {}; //接口请求成功，但不能正常返回数据。
             errorObj={
                code: codeError ?? code ?? undefined,
                message: message ?? msg ?? info,
                errorText: this._errorCodeType(code)
            };
        } else {
            const customError: any = this.customErrorHandle(error, requestConfig);
            errorObj = customError ?? error;
        }
        return errorObj
    }

    /**
     * @function 请求错误状态码
     * @param code
     */
    private _errorCodeType(code: number | string) {
        let errMessage = '';
        switch (code) {
            case 400:
                errMessage = '错误的请求';
                break;
            case 401:
                errMessage = '未授权，请重新登录';
                break;
            case 403:
                errMessage = '拒绝访问';
                break;
            case 404:
                errMessage = '请求错误,未找到该资源';
                break;
            case 405:
                errMessage = '请求方法未允许';
                break;
            case 408:
                errMessage = '请求超时';
                break;
            case 500:
                errMessage = '服务器端出错';
                break;
            case 501:
                errMessage = '网络未实现';
                break;
            case 502:
                errMessage = '网络错误';
                break;
            case 503:
                errMessage = '服务不可用';
                break;
            case 504:
                errMessage = '网络超时';
                break;
            case 505:
                errMessage = 'http版本不支持该请求';
                break;
            case 'ECONNABORTED':
                errMessage = '请求超时';
                break;
            default:
                errMessage = `未知错误 --${code}`;
        }
        return errMessage;
    }

    /**
     * @function 初始化全局参数
     */
    private _initializaGlobalConfig({baseUrl, timeout}: GlobalConfig) {
        baseUrl && this._validateConfigType('baseUrl', baseUrl) && (this.globalBaseUrl = baseUrl);
        timeout && this._validateConfigType('timeout', timeout) && (this.globalTimeout = timeout);
    }

    /**
     * @function 获取请求参数
     */
    private _getRequestParameter(options) {
        const parameter: any = {};
        const defaultApiKey = ['url', 'method', 'headers']; //请求参数默认key
        for (const item of defaultApiKey) {
            Object.keys(options).includes(item) && (parameter[item] = options[item]);
        }
        for (const key in options) {
            if (key === 'baseUrl') {
                parameter['baseURL'] = options[key];
            } else if (key === 'contentType') {
                parameter['headers'] = {
                    ...(parameter.headers || {}),
                    ...CONTENT_TYPE_REFLECT[options[key]]
                };
            } else if (key === 'method') {
                if (options[key] === 'get') {
                    parameter['params'] = options['data'] ?? {};
                    parameter['params'] = this._deleteValueEmpty(parameter['params']);
                } else {
                    parameter['data'] = options['data'] ?? {};
                }
            }
        }

        return parameter;
    }

    /**
     * @function 合并配置
     * @param requestOptions
     */
    private _getMergeRequestOptions(requestOptions: RequestOptions) {
        const mergeConfig = Object.assign({}, this._defaultReqOptions, requestOptions);
        for (const key in mergeConfig) {
            if (!this._validateConfigType(key, mergeConfig[key])) {
                if (this._defaultReqOptions[key]) {
                    mergeConfig[key] = this._defaultReqOptions[key];
                } else {
                    Reflect.deleteProperty(mergeConfig, key);
                }
            }
        }
        return {...mergeConfig};
    }

    /**
     * @function 校验参数类型是否正确
     */
    private _validateConfigType(key, value) {
        // 请求参数 key值和其校验函数的映射
        const validateReflect = {
            url: (data) => isBasicType(data, 'string'),
            baseUrl: (data) => isBasicType(data, 'string'),
            method: (data) => SUPPORT_METHOD.includes(data),
            headers: (data) => Object.prototype.toString.call(data) === '[object Object]',
            data: (data) => true,
            timeout: (data) => isBasicType(data, 'number'),
            retryTimes: (data) => isBasicType(data, 'number') && data >= 1,
            contentType: (data) => Object.keys(CONTENT_TYPE_REFLECT).includes(data),
            isHandleSuccessReturnData: (data) => isBasicType(data, 'boolean'),
            isHandleErrorReturnData: (data) => isBasicType(data, 'boolean'),
            isCancelRepeatRequest: (data) => isBasicType(data, 'boolean')
        };

        // 判断是否为基础数据类型
        function isBasicType(data, type: 'string' | 'number' | 'boolean') {
            return typeof data === type;
        }

        return validateReflect[key] ? validateReflect[key](value) : false;
    }

    /**
     * @function 初始化axios实例
     */
    private _initializaAxios() {
        this._instance = axios.create({baseURL: this.globalBaseUrl, timeout: this.globalTimeout});
        this._instance.interceptors.request.use(this.axiosRequestInterceptorsSuccess, this.axiosRequestInterceptorsError);
        this._instance.interceptors.response.use(
            this.axiosResponseInterceptorsSuccess,
            this.axiosResponseInterceptorsError
        );
    }

    /**
     * @function axios请求拦截器
     */
    axiosRequestInterceptorsSuccess(config) {
        return config;
    }

    /**
     * @function axios请求拦截器--请求发生错误
     */
    axiosRequestInterceptorsError(error) {
        throw error;
    }

    /**
     * @function axios响应拦截器--响应成功，状态码为2xx以内
     */
    axiosResponseInterceptorsSuccess(res) {
        return res;
    }

    /**
     * @function axios响应拦截器--响应失败，状态码码为2xx以外
     */
    axiosResponseInterceptorsError(error) {
        throw error;
    }

    /**
     * 清除对象属性值为空字符串、null、undefined的属性
     * @param target
     */
    _deleteValueEmpty = (target: any) => {
        // 循环对象，删除空字符串对应的key
        let newParams: any = {};
        for (let key in target) {
            if (target[key] !== '' && target[key] !== null && target[key] !== undefined) {
                newParams[key] = target[key];
            }
        }
        return newParams;
    };
}


export type{GlobalConfig,RequestOptions}
export default MoluFetch;
