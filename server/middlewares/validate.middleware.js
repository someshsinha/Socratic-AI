import { body, validationResult } from 'express-validator';

// TODO: RESTORE BEFORE PRODUCTION - Revert body('topic') back to body('title') and body('creator') once Auth0 and title payloads are wired on the frontend
export const validateCourse = [
    body('topic').notEmpty().withMessage('Topic is required'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: true,
                message: errors.array().map(err => `${err.path}: ${err.msg}`).join(', ')
            });
        }
        next();
    }
];

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: true,
            message: errors.array().map(err => `${err.path}: ${err.msg}`).join(', ')
        });
    }
    next();
};

export default validate;