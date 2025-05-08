import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export default registerAs('sendgrid', () => {
  const envVarsSchema = Joi.object({
    SENDGRID_API_KEY: Joi.string().required(),
    SENDGRID_FROM_EMAIL: Joi.string().email().required(),
    SENDGRID_FROM_NAME: Joi.string().required(),
  }).unknown();

  const { value: envVars, error } = envVarsSchema
    .prefs({ errors: { label: 'key' } })
    .validate(process.env);

  if (error) {
    throw new Error(`Config validation error: ${error.message}`);
  }

  return {
    apiKey: envVars.SENDGRID_API_KEY,
    fromEmail: envVars.SENDGRID_FROM_EMAIL,
    fromName: envVars.SENDGRID_FROM_NAME,
  };
});
