import { RequestHandler } from "express";
import * as yup from 'yup';

export const validate = (schema: any): RequestHandler => {
    return async (req, res, next) => {
        console.log('Validation middleware called');

        if (!req.body) {
            console.log('Empty body');
            return res.status(422).json({ error: "Invalid request (empty body)" });
        }

        const schemaToValidate = yup.object({
            body: schema
        });

        try {
            await schemaToValidate.validate({
                body: req.body
            }, {
                abortEarly: true
            });
            console.log('Validation passed');
            next();
        } catch (error) {
            console.log('erororororoorororor', error);

            if (error instanceof yup.ValidationError) {
                console.log('Validation error:', error.message);
                return res.status(422).json({ error: error.message });
            }
        }
    }
}
