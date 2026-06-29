import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
export async function writeStreamToFile(
  readStream: NodeJS.ReadableStream,
  absPath: string,
) {
  await pipeline(readStream, createWriteStream(absPath));
}
