import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secret_key";

/**
 * Generate JWT token from user payload
 * @param {Object} user - user object { id, email, role }
 * @param {String} expiresIn - token expiration time (default: 7d)
 * @returns {String} token
 */
export function generateJwtToken(user, expiresIn = "7d") {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn }
  );
}

/**
 * Verify token and return payload (throws error if invalid)
 * @param {String} token - JWT token
 * @returns {Object} decoded payload
 */
export function verifyJwtToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

/**
 * Decode token without verifying
 * @param {String} token - JWT token
 * @returns {Object|null} decoded payload
 */
export function decodeJwtToken(token) {
  return jwt.decode(token);
}
