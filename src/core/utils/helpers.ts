import bcrypt from "bcrypt";

const saltRounds = 10;

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(saltRounds);
  return await bcrypt.hash(password, salt);
};

export const comparePassword = async (
  plain: string,
  hashedPassword: string
): Promise<boolean> => {
  try {
    return await bcrypt.compare(plain, hashedPassword);
  } catch (err) {
    console.error("Error comparing passwords:", err);
    return false;
  }
};
