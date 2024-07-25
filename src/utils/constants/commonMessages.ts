interface errorMessage {
    ok: { EC: number, EM: string },
    missing: { EC: number, EM: string },
    duplicated: { EC: number, EM: string },
    unknown: { EC: number, EM: string },
    invalid: { EC: number, EM: string },
    notfound: { EC: number, EM: string },
    notVerified: { EC: number, EM: string },
    notPermit: { EC: number, EM: string },
}
export const constResponse: errorMessage = {
    ok: {
        EC: 0, EM: 'success'
    },
    missing: {
        EC: 1, EM: 'missing value'
    },
    duplicated: {
        EC: 2, EM: 'duplicated value'
    },
    unknown: {
        EC: 3, EM: 'unknonw error, plz log error'
    },
    invalid: {
        EC: 4, EM: 'invalid request'
    },
    notfound: {
        EC: 5, EM: 'not found record'
    },
    notVerified: {
        EC: 6, EM: 'You must verified first'
    },
    notPermit: {
        EC: 7, EM: 'You are not allowed'
    }
}