import Joi from 'joi';
// Joi validation schemas
const joiTextContentSchema = Joi.object({
    text: Joi.string().required()
});

const joiVideoContentSchema = Joi.object({
    url: Joi.string().uri().required(),
    key: Joi.string().required(),
    description: Joi.string().optional()
});

const joiImageContentSchema = Joi.object({
    url: Joi.string().uri().required(),
    key: Joi.string().required(),
    caption: Joi.string().optional()
});

const joiQuizContentSchema = Joi.object({
    quizId: Joi.string().required()
});

const joiInteractiveContentSchema = Joi.object({
    interactiveId: Joi.string().required()
});

export const validateContent = (content: any) => {
    for (const item of content) {
        switch (item.type) {
            case 'text':
                if (joiTextContentSchema.validate(item.data).error) return false;
                break;
            case 'video':
                if (joiVideoContentSchema.validate(item.data).error) return false;
                break;
            case 'image':
                if (joiImageContentSchema.validate(item.data).error) return false;
                break;
            case 'quiz':
                if (joiQuizContentSchema.validate(item.data).error) return false;
                break;
            case 'interactive':
                if (joiInteractiveContentSchema.validate(item.data).error) return false;
                break;
            default:
                return false;
        }
    }
    return true;
};