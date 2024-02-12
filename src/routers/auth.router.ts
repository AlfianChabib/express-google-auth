import { Request, Response, Router } from "express";
import passport from "passport";
import { config } from "dotenv";

config();

const authRouter = Router();

authRouter.get("/google", passport.authenticate("google"));
authRouter.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: process.env.CLIENT_URL!,
    failureRedirect: `http://localhost:8000/api/v1/auth/login/failed`,
  })
);

authRouter.get("/login/success", (req: Request, res: Response) => {
  if (req.user) {
    return res.status(200).json({
      user: req.user,
    });
  } else {
    return res.status(401).json({
      message: "Not Authorized",
    });
  }
});

authRouter.get("/login/failed", (_req: Request, res: Response) => {
  res.status(401).json({
    message: "Login Failure",
  });
});

authRouter.get("/logout", (req: Request, res: Response) => {
  req.logOut({}, (err: any) => {
    if (err) return res.status(500).json({ message: "Something when wrong." });
    res.redirect(process.env.CLIENT_URL!);
  });
});

export default authRouter;
