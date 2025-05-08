import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export default registerAs('otp', () => {
  const envVarsSchema = Joi.object({
    OTP_EXPIRY_MINUTES: Joi.number().default(15).required(),
    OTP_LENGTH: Joi.number().default(6).required(),
  }).unknown();

  const { value: envVars, error } = envVarsSchema
    .prefs({ errors: { label: 'key' } })
    .validate(process.env);

  if (error) {
    throw new Error(`Config validation error: ${error.message}`);
  }

  return {
    expiryMinutes: envVars.OTP_EXPIRY_MINUTES,
    length: envVars.OTP_LENGTH,
  };
});
