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
