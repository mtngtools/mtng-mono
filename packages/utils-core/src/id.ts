export const ALPHA_LOWER_NUMS = "123456789abcdefghjkmnpqrstuvwxyz";
export const randomToken = (numChars = 4) => {
  let token = "";
  for (let char_i = 0; char_i < numChars; char_i++) {
    let rand = Math.trunc(100 * Math.random());
    token += ALPHA_LOWER_NUMS[rand % ALPHA_LOWER_NUMS.length];
  }
  return token;
}

export const genUniqueId = (prefix = '') => {
  return `${prefix}-${generateUUID()}`;
}

export const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID() as string;
  }

  //fallback
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  }) as string;
} 