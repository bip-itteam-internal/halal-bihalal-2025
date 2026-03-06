import { createListCollection } from "@chakra-ui/react";

export function formatToE164(phoneNumber: string, countryCode: string = "62"): string {
  // Remove all non-digit characters
  let cleanedNumber = phoneNumber.replace(/\D/g, '');

  // Remove leading zero if present
  if (cleanedNumber.startsWith('0'))
    cleanedNumber = cleanedNumber.substring(1);

  if (cleanedNumber.startsWith('+62'))
    cleanedNumber = cleanedNumber.substring(3);

  if (cleanedNumber.startsWith('62'))
    cleanedNumber = cleanedNumber.substring(2);


  // Return in E.164 format
  return `${countryCode}${cleanedNumber}`;
}

export const SHIRT_SIZES = createListCollection({
  items: [
    { label: "S (P: 67  L: 48)", value: "S (P: 67  L: 48)" },
    { label: "M (P: 69  L: 50)", value: "M (P: 69  L: 50)" },
    { label: "L (P: 71  L: 52)", value: "L (P: 71  L: 52)" },
    { label: "XL (P: 73  L: 54)", value: "XL (P: 73  L: 54)" },
    { label: "2XL (P: 75 L: 56)", value: "2XL (P: 75 L: 56)" },
    { label: "3XL (P: 75  L: 58)", value: "3XL (P: 75  L: 58)" },
  ],
})