import { ErrorObject } from "./types.js";

class RestError extends Error {
    public errorType: string;
    public code?: number;
    public params?: any;

    constructor(error: ErrorObject) {
        let errorMessage = '';

        if (error instanceof Error) {
            errorMessage = error.message;
        } else {
            errorMessage = error.error;
        }

        super(errorMessage);

        if (!(error instanceof Error)) {
            this.name = error.name || 'RestError';
            this.code = error.code;
        }

        this.errorType = this.getErrorType(this.code || 500);

        if (error.params) {
            this.params = error.params;
        }

        // Ensure correct prototype chain
        Object.setPrototypeOf(this, RestError.prototype);
    }

    private getErrorType(code: number): string {
        switch (code) {
            case 0:
                return 'AUTH_DECLINED';
            case 1:
                return 'MISSING_INPUT_PARAM';
            case 2:
                return 'INVALID_INPUT_PARAM';
            case 404:
                return 'NOT_FOUND';
            default:
                return 'INTERNAL_SERVER_ERROR';
        }
    }
}

export default RestError;
