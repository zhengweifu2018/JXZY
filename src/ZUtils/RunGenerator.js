require('babel-polyfill'); /* (RunGenerator) 解决 Uncaught ReferenceError: regeneratorRuntime is not defined */
/**
 * A generator function runner
 * @param  {[generatorFunction generator 函数]}
 * @return {[type]}
 */
export default (generatorFunction) => {
    // 递归 next()
    let next = function (arg) {
    // let next = function (err, arg) {
        // if error - throw and error
        // if (err) {
        //  return it.throw(err);
        // }

        // cache it.next(arg) as result
        let result = it.next(arg);

        // are we done?
        if (result.done) {
            return;
        }

        // result.value should be our callback() function from the XHR request
        if (typeof result.value == 'function') {
            // call next() as the callback()
            result.value(next);
        } else {
            // if the response isn't a function
            // pass it to next()
            // next(null, result.value);
            next(result.value);
        }
    };

    // create the iterator
    let it = generatorFunction();
    return next();
};