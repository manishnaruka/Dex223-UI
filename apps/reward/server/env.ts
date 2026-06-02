import * as yup from "yup";

const schema = yup.object({
  DATABASE_URL: yup.string().required(),
  SESSION_SECRET: yup.string().min(32).required(),
  CRON_SECRET: yup.string().min(8).required(),
  GENESIS_TS: yup.string().required(),
  REWARD_RATE_BPS: yup
    .number()
    .integer()
    .min(0)
    .max(10_000)
    .default(25),
  REWARD_FEE_CLAMP_MULTIPLIER: yup.number().min(0).default(1),
  PUBLIC_REFERRAL_BASE_URL: yup
    .string()
    .required()
    .matches(/^https?:\/\//i, "PUBLIC_REFERRAL_BASE_URL must start with http:// or https://"),
  // Origin of apps/web, allowed to call the SIWE + join routes cross-origin (CORS).
  WEB_APP_ORIGIN: yup
    .string()
    .default("http://localhost:3000")
    .matches(/^https?:\/\//i, "WEB_APP_ORIGIN must start with http:// or https://"),
});

const parsed = schema.validateSync(process.env, { abortEarly: false, stripUnknown: false });

export const env = {
  DATABASE_URL: parsed.DATABASE_URL,
  SESSION_SECRET: parsed.SESSION_SECRET,
  CRON_SECRET: parsed.CRON_SECRET,
  GENESIS_TS: new Date(parsed.GENESIS_TS),
  REWARD_RATE_BPS: parsed.REWARD_RATE_BPS,
  REWARD_FEE_CLAMP_MULTIPLIER: parsed.REWARD_FEE_CLAMP_MULTIPLIER,
  PUBLIC_REFERRAL_BASE_URL: parsed.PUBLIC_REFERRAL_BASE_URL,
  WEB_APP_ORIGIN: parsed.WEB_APP_ORIGIN,
};
