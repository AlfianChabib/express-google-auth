import { Express } from "express";
import session from "express-session";
import passport from "passport";
import {
  Strategy as GoogleStrategy,
  Profile,
  VerifyCallback,
} from "passport-google-oauth20";
import prisma from "./prisma";

const passportUtil = (app: Express) => {
  app.use(
    session({
      secret: process.env.SESSION_SECRET!,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 1 day
      },
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: process.env.GOOGLE_CALLBACK_URL!,
        scope: ["profile", "email"],
      },
      async (
        accessToken: string,
        refreshToken: string,
        profile: Profile,
        done: VerifyCallback
      ) => {
        const profileUser = {
          email: profile._json.email,
          username: profile._json.name,
          googleId: profile.id,
          picture: profile._json.picture,
        };

        const user = await prisma.user.findUnique({
          where: {
            email: profileUser.email,
          },
        });

        if (user) {
          await prisma.user.update({
            where: {
              email: profile._json.email!,
            },
            data: {
              refreshToken: refreshToken,
              accessToken: accessToken,
            },
          });

          return done(null, { user: user, id: user.id });
        }

        if (!user && profileUser) {
          const newUser = await prisma.user.create({
            data: {
              fullName: profileUser.username!,
              email: profileUser.email!,
              googleId: profileUser.googleId!,
              accessToken: accessToken,
              picture: profileUser.picture!,
            },
          });

          return done(null, { user: newUser, id: newUser.id });
        }
      }
    )
  );
  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser(async (id: string, done) => {
    const user = await prisma.user.findFirst({
      where: {
        googleId: id,
      },
    });
    if (user) {
      console.log(user);
      done(null, user);
    }
    if (!user) {
      return done(null, undefined);
    }
  });
};

export default passportUtil;
