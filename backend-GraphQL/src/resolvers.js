import axios from "axios";
import { BlobServiceClient } from "@azure/storage-blob";
import { SecretClient } from "@azure/keyvault-secrets";
import { DefaultAzureCredential } from "@azure/identity";
import * as fs from "fs";
import FormData from "form-data";
import { GraphQLUpload } from "graphql-upload";
import { CosmosClient } from "@azure/cosmos";
import { v4 as uuidv4 } from "uuid";
import { pipeline } from "stream";
import { promisify } from "util";

const pipelineAsync = promisify(pipeline);

// Key Vault setup
const vaultName = process.env.AZURE_KEY_VAULT_NAME;
const vaultUrl = `https://${vaultName}.vault.azure.net`;
const credential = new DefaultAzureCredential({
  managedIdentityClientId: process.env.MANAGED_IDENTITY_CLIENT_ID,
});
const secretClient = new SecretClient(vaultUrl, credential);

async function getSecret(secretName) {
  try {
    const secret = await secretClient.getSecret(secretName);
    console.log(`Successfully retrieved secret: ${secretName}`);
    return secret.value;
  } catch (error) {
    console.error(`Error fetching secret "${secretName}":`, error.message);
    throw new Error(`Failed to fetch secret: ${secretName}`);
  }
}

// Cosmos DB setup
const databaseName = "TranscriptionDB";
const containerName = "Transcriptions";

let cosmosContainer;

async function initCosmosDb() {
  const connectionString = await getSecret("COSMOSCONNECTIONSTRING");
  const client = new CosmosClient(connectionString);
  const database = client.database(databaseName);
  cosmosContainer = database.container(containerName);
  console.log(`Connected to Cosmos DB: ${databaseName}/${containerName}`);
}

// Initialize Cosmos DB connection
initCosmosDb();

const resolvers = {
  Upload: GraphQLUpload,
  Query: {
    hello: () => "Hello from Azure Backend!",

    // List all stored transcriptions
    listTranscriptions: async () => {
      try {
        const { resources } = await cosmosContainer.items.query("SELECT c.id, c.filename FROM c").fetchAll();
        return resources;
      } catch (error) {
        console.error("Error fetching transcriptions:", error.message);
        throw new Error("Could not fetch transcriptions.");
      }
    },

    // Fetch transcription details by ID
    getTranscription: async (parent, { id }) => {
      try {
        const { resource } = await cosmosContainer.item(id, id).read();
        return resource;
      } catch (error) {
        console.error(`Error fetching transcription with ID ${id}:`, error.message);
        throw new Error(`Could not fetch transcription with ID ${id}.`);
      }
    },
  },
  Mutation: {
    uploadFile: async (parent, { file }) => {
      const { createReadStream, filename } = await file;
      const id = uuidv4();
      const filePath = `/tmp/${id}-${filename}`;

      try {
        console.log("---- STARTING FILE UPLOAD ----");
        console.log(`Original filename: ${filename}`);
        console.log(`Temporary file path: ${filePath}`);

        // Save the uploaded file to /tmp
        const stream = createReadStream();
        const writeStream = fs.createWriteStream(filePath);
        await pipelineAsync(stream, writeStream);
        console.log("File saved successfully to temporary storage.");

        // Fetch secrets from Azure Key Vault
        console.log("Fetching secrets from Azure Key Vault...");
        const subscriptionKey = await getSecret("AZURESUBSCRIPTIONKEY");
        const endpoint = await getSecret("AZUREENDPOINT");
        const storageAccountUrl = await getSecret("AZURESTORAGEACCOUNTURL");
        const sasToken = await getSecret("AZURESASTOKEN");
        console.log("Storage Account URL and SAS token retrieved.");

        // Upload the WAV file to Azure Blob Storage
        console.log("Uploading file to Azure Blob Storage...");
        const blobServiceClient = new BlobServiceClient(`${storageAccountUrl}?${sasToken}`);
        const containerClient = blobServiceClient.getContainerClient("wav-files");
        const blockBlobClient = containerClient.getBlockBlobClient(`${id}-${filename}`);

        await blockBlobClient.uploadFile(filePath);
        console.log("File uploaded to Azure Blob Storage successfully.");

        const fileUrl = `${storageAccountUrl}/wav-files/${id}-${filename}`;
        console.log(`File URL: ${fileUrl}`);

        // Send transcription request to Azure
        console.log("Sending transcription request...");
        const form = new FormData();
        form.append("audio", fs.createReadStream(filePath));
        form.append(
          "definition",
          JSON.stringify({
            locales: ["en-US"],
            profanityFilterMode: "Masked",
            channels: [0, 1],
          })
        );

        const response = await axios.post(
          `${endpoint}/speechtotext/transcriptions:transcribe?api-version=2024-05-15-preview`,
          form,
          {
            headers: {
              ...form.getHeaders(),
              "Ocp-Apim-Subscription-Key": subscriptionKey,
            },
          }
        );

        console.log("Azure Speech API response received.");
        console.log("Response Data:", JSON.stringify(response.data, null, 2));

        // Extract transcription
        const combinedPhrases = response.data?.combinedPhrases;
        if (!combinedPhrases || combinedPhrases.length === 0) {
          throw new Error("Transcription result not available in the response.");
        }

        const transcription = combinedPhrases.map((phrase) => phrase.text).join(" ");
        console.log("Transcription completed successfully.");

        // Store transcription in Cosmos DB
        await cosmosContainer.items.create({
          id,
          filename,
          transcription,
          fileUrl,
          createdAt: new Date().toISOString(),
        });
        console.log(`Transcription stored in Cosmos DB with ID: ${id}`);

        return {
          success: true,
          message: `Transcription: ${transcription}`,
        };
      } catch (error) {
        console.error("Error during transcription process:", error.response?.data || error.message);
        return {
          success: false,
          message: `Transcription failed: ${error.message}`,
        };
      } finally {
        try {
          fs.unlinkSync(filePath);
          console.log(`Temporary file deleted: ${filePath}`);
        } catch (cleanupError) {
          console.error(`Error cleaning up temporary file: ${cleanupError.message}`);
        }
        console.log("---- FILE UPLOAD PROCESS COMPLETED ----");
      }
    },
  },
};

export default resolvers;
