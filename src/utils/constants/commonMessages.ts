interface errorMessage {
    ok: { EC: number, EM: string },
    missing: { EC: number, EM: string },
    duplicated: { EC: number, EM: string },
    unknown: { EC: number, EM: string },
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
}