import jwt from "jsonwebtoken";

// Creates authentication JWTs from a user's identity and role.

export const generateToken = (user) => {
  return jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role,
      tokenVersion: user.tokenVersion ?? 0,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    },
  );
};
