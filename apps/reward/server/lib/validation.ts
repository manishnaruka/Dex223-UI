import * as yup from "yup";

const ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;

export const addressSchema = yup
  .string()
  .required()
  .matches(ADDRESS_RE, "Invalid Ethereum address");

export const joinBodySchema = yup.object({
  referrerSlug: addressSchema,
});

export const siweNonceSchema = yup.object({
  address: addressSchema,
});

export const siweVerifySchema = yup.object({
  address: addressSchema,
  message: yup.string().required(),
  signature: yup
    .string()
    .required()
    .matches(/^0x[a-fA-F0-9]+$/, "Invalid signature"),
});

export function normalizeAddress(address: string): string {
  return address.toLowerCase();
}
