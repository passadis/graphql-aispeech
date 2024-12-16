import * as fs from "fs";
import { promisify } from "util";
import { pipeline } from "stream";
import { v4 as uuidv4 } from "uuid";

const pipelineAsync = promisify(pipeline);

export const saveFile = async (file) => {
  const { createReadStream, filename } = await file;
  const uniqueFilename = `${uuidv4()}-${filename}`;
  const filePath = `/tmp/${uniqueFilename}`; // Use temporary directory

  const stream = createReadStream();
  const writeStream = fs.createWriteStream(filePath);
  await pipelineAsync(stream, writeStream);

  return { filePath, uniqueFilename };
};

export const deleteFile = (filePath) => {
  try {
    fs.unlinkSync(filePath);
    console.log(`Deleted temporary file: ${filePath}`);
  } catch (error) {
    console.error(`Error deleting file: ${filePath}`, error);
  }
};
