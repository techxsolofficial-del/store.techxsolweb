import { ZodError } from 'zod';
export const validateRequest = (schema) => {
    return async (req, res, next) => {
        try {
            req.body = await schema.parseAsync(req.body);
            next();
        }
        catch (error) {
            if (error instanceof ZodError || error?.name === 'ZodError' || Array.isArray(error?.issues) || Array.isArray(error?.errors)) {
                const issues = error.errors || error.issues || [];
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Input validation failed. Please review the highlighted fields.',
                        details: issues.map((err) => ({
                            field: Array.isArray(err.path) ? err.path.join('.') : String(err.path || ''),
                            message: err.message,
                        })),
                    },
                });
                return;
            }
            next(error);
        }
    };
};
//# sourceMappingURL=validate.js.map