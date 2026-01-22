import env from "#/configs/env.js";
import server from "#/server.js";

const port = env.PORT;

server.listen(port, () => {
  console.log(`Socket server listening on port: ${port}`);
});
