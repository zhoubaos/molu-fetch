import {Md5} from 'ts-md5'; //md5加密
import type{ RequestCacheItem} from "./types";

export default class RequestCache {
    requestCachePool:Map<string,RequestCacheItem>=new Map(); //缓存

    /**
     * @function 添加请求缓存数据
     * @param config
     * @param data 缓存数据
     * @param time 缓存时间
     */
    addRequestCache(config,data:any,time:number){
        const key = this._getRequestKey(config); //获取请求参数唯一key
        this.requestCachePool.set(key,{
            data,
            endTime:Date.now()+Number(time)
        })
    }

    /**
     * @function 判断当前请求是否有缓存值且未过期
     * @param config
     */
    isExistRequestCache(config){
        const key = this._getRequestKey(config); //获取请求参数唯一key
        console.log(this.requestCachePool.get(key)?.endTime)
        return this.requestCachePool.has(key) && (this.requestCachePool.get(key)?.endTime as number >= Date.now())
    }

    /**
     * @function 获取缓存值
     * @param config
     */
    getCacheData(config){
         const key = this._getRequestKey(config); //获取请求参数唯一key
        return this.requestCachePool.get(key)?.data
    }

    /**
     * @function 获取每次请求参数的唯一key，根据请求方法，路径和请求参数来判断是否为同一请求
     * @param config 请求参数
     */
    private _getRequestKey(config: any) {
        const {method, url, params, data} = config;
        const paramStr = this._getTargetDataToStr({method, url, params, data});
        return Md5.hashStr(paramStr);
    }

    /**
     * @function 把目标对象内的所有值转为字符串，用于后续获取hash值
     * @param target
     * @returns
     */
    private _getTargetDataToStr(target) {
        if (typeof target !== 'object' || target === null) return target + '&';
        let str = '';
        let aStr: any = null;
        if (Array.isArray(target)) {
            aStr = target;
        } else {
            aStr = Object.values(target);
        }

        aStr.forEach((item) => {
            str += this._getTargetDataToStr(item);
        });
        return str;
    }

}