import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../models/userModel.js"; 

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback", // Pastikan ini sesuai dengan yang ada di Google Cloud Console
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const existingUser = await User.findOne({ where: { googleId: profile.id } });

        if (existingUser) {
          return done(null, existingUser);
        }

        // Saat membuat user baru...
        const newUser = await User.create({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          password: "google-oauth", // Password dummy
          isVerified: true, // <-- TAMBAHKAN BARIS INI
        });

        return done(null, newUser);
      } catch (error) {
        return done(error, false); // Beri parameter kedua 'false' untuk menandakan kegagalan
      }
    }
  )
);

// Bagian serialize/deserialize tidak perlu diubah
passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});