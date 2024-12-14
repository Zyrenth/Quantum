
/**
 * @description A utility function to catch errors in async functions.
 * @param func The function to run.
 * @returns An array containing the output of the function and any errors that occurred.
 */
export const trycatch = async <T>(func: () => Promise<T>) => {
    // @ts-ignore
    const output: [T, any] = [undefined, undefined];

    try {
        output[0] = await func();
    } catch (err) {
        output[1] = err;
    }

    return output;
};
