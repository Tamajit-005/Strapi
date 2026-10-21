import { readFile } from "node:fs/promises";
import path from "node:path";

// The dotLottie player ships a 1.2 MB wasm module. Serving it brotli
// compressed cuts the transfer to ~380 KB; the browser decodes it
// transparently, so the player still gets the raw module.
export const dynamic = "force-static";

export async function GET() {
  const file = await readFile(
    path.join(process.cwd(), "src/dotlottie/player.wasm.br")
  );

  return new Response(new Uint8Array(file), {
    headers: {
      "Content-Type": "application/wasm",
      "Content-Encoding": "br",
    },
  });
}
