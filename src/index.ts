import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { PORT } from "./config";
import apiRouter from "./routers/main.router";
import passportUtil from "./utils/passport";
import morgan from "morgan";
import helmet from "helmet";

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(express.json());
app.use(cookieParser());
passportUtil(app);
app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: "GET, POST, PATCH, DELETE, PUT",
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(helmet());

app.use("/api/v1", apiRouter);
app.get("/api/", (req, res) => {
  return res.send("Wellcome to api");
});

app.listen(PORT, () => {
  console.log(`⚡️[server]: Running at https://localhost:${PORT}/api/v1`);
});
