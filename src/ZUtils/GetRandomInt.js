/**
 * 得到指定范围内的随机整数
 * @param  {[type]}
 * @param  {[type]}
 * @return {[type]}
 */
export default (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};