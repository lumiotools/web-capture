import express from "express";
import cors from "cors";
import fs from "fs";
import { handleWebsiteCapture } from "./controller.js";
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "*",
  })
);

if (!fs.existsSync("captures")) {
  fs.mkdirSync("captures", { recursive: true });
}

app.get("/", (req, res) => {
  res.send("server is healthy ...");
});

app.get("/api/web-capture", handleWebsiteCapture);

app.use("/captures", express.static("captures"));

const PORT = parseInt(process.env.PORT) || 5000;

app.listen(PORT, () => {
  console.log(`server listening on port ${PORT}`);
});
