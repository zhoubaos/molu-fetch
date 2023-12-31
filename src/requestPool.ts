import {Md5} from 'ts-md5'; //md5加密

export default class RequestPool {
    requestPool: Map<any, any> = new Map(); //api请求池
    delayTime: number = 200; //请求成功后延迟多少毫秒再进行下一次请求
    constructor(delay?: number) {
        delay && (this.delayTime = delay);
    }

    /**
     * @function 在请求链接池添加接口
     */
    addRequest(config) {
        const key = this._getRequestKey(config); //获取请求参数唯一key
        // 接口未重复
        if (!this.isExistRequest(config)) {
            this.requestPool.set(key, config);
        }
    }
    /**
     * @function 判断当前请求是否存在于请求池
     * @param config
     */
    isExistRequest(config){
        const key = this._getRequestKey(config); //获取请求参数唯一key
        return this.requestPool.has(key)
    }

    /**
     * @function 从请求池中删除已完成的api
     * @param config 请求参数
     * @param type 类型 success | error
     */
    removefinishRequest(config) {
        const key = this._getRequestKey(config);
        setTimeout(() => {
            this.requestPool.delete(key);
        }, this.delayTime);
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
     * @function 把目标对象内的所有值转为字符串
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
