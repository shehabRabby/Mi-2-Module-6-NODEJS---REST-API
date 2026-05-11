import type { IncomingMessage } from "http";

export const parseBody = (req: IncomingMessage): Promise<any> => {
  return new Promise((resolve, reject) => {
    let body = "";

    // Listen for data chunks
    req.on("data", (chunk) => {
      // Converting chunk to string explicitly prevents buffer issues
      body += chunk.toString();
    });

    // Listen for the end of the stream
    req.on("end", () => {
      try {
        // 1. Check if the body is empty or just whitespace
        if (!body || body.trim() === "") {
          return resolve({});
        }

        // 2. Attempt to parse the JSON
        resolve(JSON.parse(body));
      } catch (error) {
        // 3. If parsing fails (invalid JSON), reject with a clear message
        console.error("JSON Parse Error:", error);
        reject(new Error("Invalid JSON format in request body"));
      }
    });

    // Handle stream errors
    req.on("error", (err) => {
      reject(err);
    });
  });
};
