import * as dotenv from "dotenv";
import express from "express";
import AccountsRouter from "./routes/AccountsRouter";

const app = express();
app.use(express.json());
app.use(AccountsRouter);

dotenv.config();
const port = process.env.PORT;

app.listen(port, () => {
  console.log("api iniciada!", port);
});
