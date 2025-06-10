const buildResponseSuccess = (message, data) => {
    return {
        status: true,
        message: message,
        data: data,
    };
}

const buildResponseFailed = (message, error, data) => {
    return {
        status: false,
        message: message,
        error: error,
        data: data,
    };
}

module.exports = {
    buildResponseFailed,
    buildResponseSuccess
}