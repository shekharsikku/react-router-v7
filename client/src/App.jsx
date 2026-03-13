import { useState, useEffect } from "react";

const App = () => {
  const [message, setMessage] = useState("Hello, World!");

  useEffect(() => {
    (async () => {
      try {
        const result = await fetch("http://localhost:4000/hello", {
          credentials: "include",
        }).then((res) => res.json());

        setMessage(result.message);
      } catch (error) {
        console.log(`Error: ${error.message}`);
      }
    })();
  }, []);

  return (
    <div className="flex flex-col space-y-4 min-w-96 justify-center text-center">
      <h1 className="text-xl font-semibold">{message}</h1>
    </div>
  );
};

export default App;
