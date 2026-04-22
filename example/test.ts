import { readFileSync } from "fs";
import path from "path";
import { createApp } from "./app";

async function run() {
  const app = await createApp();
  const address = await app.listen(0, "127.0.0.1");
  const port = typeof address === "string" ? Number(address.split(":").pop()) : address;

  try {
    const formData = new (globalThis as any).FormData();
    const file = readFileSync(path.join(__dirname, "sample.txt"));
    const blob = new (globalThis as any).Blob([file], { type: "text/plain" });
    formData.append("file", blob, "sample.txt");
    formData.append("title", "example-upload");

    const response = await fetch(`http://127.0.0.1:${port}/upload`, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    console.log("upload response status:", response.status);
    console.log("upload response body:", JSON.stringify(result, null, 2));

    if (!response.ok) {
      throw new Error(`Upload failed with status ${response.status}`);
    }
  } finally {
    await app.close();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
