import { z } from "zod";

// Optional text field: trims input and stores empty values as null
function optionalText(max: number, tooLong: string) {
  return z
    .string()
    .trim()
    .max(max, tooLong)
    .transform((value) => (value === "" ? null : value));
}

export const contactInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Укажите имя")
    .max(200, "Имя слишком длинное — не больше 200 символов"),
  about: optionalText(1000, "Не больше 1000 символов"),
  howWeMet: optionalText(1000, "Не больше 1000 символов"),
  phone: optionalText(50, "Телефон слишком длинный").refine(
    (value) => value === null || /^[\d\s+()\-.]{3,}$/.test(value),
    "Телефон может содержать только цифры, пробелы и символы + ( ) -",
  ),
  email: optionalText(254, "Почта слишком длинная").refine(
    (value) => value === null || z.email().safeParse(value).success,
    "Похоже, в адресе почты ошибка",
  ),
});

export type ContactInput = z.infer<typeof contactInputSchema>;
export type ContactField = keyof ContactInput;
export type ContactFormValues = Record<ContactField, string>;

export type ContactFormState = {
  values?: ContactFormValues;
  errors?: Partial<Record<ContactField, string>>;
  message?: string;
};

export const contactFields: ContactField[] = ["name", "about", "howWeMet", "phone", "email"];

export function readContactForm(formData: FormData): ContactFormValues {
  const values = {} as ContactFormValues;
  for (const field of contactFields) {
    const value = formData.get(field);
    values[field] = typeof value === "string" ? value : "";
  }
  return values;
}

export const noteInputSchema = z
  .string()
  .trim()
  .min(1, "Заметка пустая — напишите хотя бы пару слов")
  .max(10000, "Заметка слишком длинная — не больше 10 000 символов");

export type NoteFormState = {
  body?: string;
  error?: string;
  savedAt?: number;
};
