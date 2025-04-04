import 'dotenv/config';

import * as joi from 'joi';

interface EnvVars {
    PORT: number;
    SALT: number;
    SECRET_KEY: string;
}

const envVarsSchema = joi
    .object({
        PORT: joi.number().required(),
        SALT: joi.number().required(),
        SECRET_KEY: joi.string().required()
    })
    .unknown();

const { error, value } = envVarsSchema.validate(process.env);

if (error) {
    throw new Error(`Config validation error: ${error.message}`);
}

const envVars: EnvVars = value;

export const envs = {
    port: envVars.PORT,
    salt: envVars.SALT,
    secretKey: envVars.SECRET_KEY
};
