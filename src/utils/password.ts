/**
 * Password Utilities
 * Functions for hashing and comparing passwords using bcrypt
 */

import bcrypt from "bcryptjs";

/**
 * Hashes a plain text password
 * @param password - The plain text password to hash
 * @returns The hashed password
 */
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

/**
 * Compares a plain text password with a hashed password
 * @param password - The plain text password
 * @param hashedPassword - The hashed password to compare against
 * @returns True if passwords match, false otherwise
 */
export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

/**
 * Validates password strength
 * Password must be at least 6 characters long
 * @param password - The password to validate
 * @returns True if password meets requirements
 */
export const validatePassword = (password: string): boolean => {
  if (password.length < 6) {
    return false;
  }
  return true;
};
