import { HttpError } from "./http-error";

export const parseId = (value: unknown, name = "ID"): number => {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new HttpError(400, `${name} harus berupa bilangan bulat positif`);
  }
  return id;
};
