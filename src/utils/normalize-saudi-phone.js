const toEnglishDigits = (value) =>
  value.replace(/[٠-٩۰-۹]/g, (digit) => {
    const code = digit.charCodeAt(0);

    if (code >= 0x0660 && code <= 0x0669) {
      return String(code - 0x0660);
    }

    return String(code - 0x06f0);
  });

export const normalizeSaudiPhone = (value) => {
  if (typeof value !== "string") {
    return value;
  }

  const phone = toEnglishDigits(value.trim()).replace(
    /[\s().\-\u200E\u200F]/g,
    "",
  );

  // Reject unexpected characters
  if (!/^\+?\d+$/.test(phone)) {
    return value;
  }

  // International formats: +966, 00966, or 966
  const internationalMatch = phone.match(
    /^(?:\+966|00966|966)(5[013456789]\d{7})$/,
  );

  if (internationalMatch) {
    return `0${internationalMatch[1]}`;
  }

  // Local formats: 05XXXXXXXX or 5XXXXXXXX
  const localMatch = phone.match(/^0?(5[013456789]\d{7})$/);

  if (localMatch) {
    return `0${localMatch[1]}`;
  }

  // Keep invalid input unchanged so validation can reject it
  return value;
};

export const isSaudiMobilePhone = (value) =>
  typeof value === "string" &&
  /^05[013456789]\d{7}$/.test(normalizeSaudiPhone(value));
