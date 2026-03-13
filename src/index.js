import { createServer } from "node:http";
import env from "./utils/env.js";
import app from "./app.js";

const server = createServer(app);
const port = env.PORT;

(async () => {
  try {
    server.listen(port, () => {
      console.log(`Server running on port: ${port}\n`);
    });
  } catch (error) {
    console.error(`Error: ${error.message}\n`);
    process.exit(1);
  }
})();
