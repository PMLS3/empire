/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { Storage } from "@google-cloud/storage";
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as XLSX from "xlsx";
import { chunkFile, chunkText } from "../../../ai/server/utils/tools/files";
import { analyze_pdf } from "../../../ai/server/utils/tools/vertex/documents";
import { transcript_audio } from "../../../ai/server/utils/tools/vertex/audio";
import { analyze_video_with_audio } from "../../../ai/server/utils/tools/vertex/video";
import { sendMultiModalPromptWithImage } from "../../../ai/server/utils/tools/vertex/image";

admin.initializeApp();

// Initialize Firebase Admin SDK
const db = admin.firestore();
const storage = new Storage();

// Set the environment variables
const projectId = process.env.GCLOUD_PROJECT;
const location = process.env.FUNCTION_REGION || "us-central1";
const model = "gemini-1.5-flash-001";

// // Start writing functions
// // https://firebase.google.com/docs/functions/typescript

export const helloWorld = onRequest((request, response) => {
  logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});

// Function to process file uploads
exports.processFileUpload = functions.storage.object().onFinalize(async (object) => {
  try {
    // 1. Get file metadata
    const bucket = object.bucket;
    const filePath = object.name;
    const contentType = object.contentType;
    const fileStorage = storage.bucket(bucket);
    const file = fileStorage.file(filePath || "");
    const [metadata] = await file.getMetadata();
    const fileSize = metadata.size;

    console.log(`[processFileUpload] File uploaded: ${filePath} (${fileSize} bytes)`);

    if (!filePath) {
      console.error("[processFileUpload] File path is undefined");
      return;
    }

    // 2. Determine file type and process accordingly
    let understandings: any = {};

    if (contentType === "application/pdf") {
      // Process PDF files
      console.log("[processFileUpload] Processing PDF file");
      const tempFilePath = `/tmp/${filePath.split("/").pop()}`;
      await file.download({ destination: tempFilePath });
      const understanding = await analyze_pdf(projectId || "", location, model, tempFilePath);
      const chunks = await chunkFile(tempFilePath, 1024 * 1024 * 5);
      understandings = { understanding, chunks };
    } else if (contentType === "video/mp4") {
      // Process video files
      console.log("[processFileUpload] Processing video file");
      const tempFilePath = `/tmp/${filePath.split("/").pop()}`;
      await file.download({ destination: tempFilePath });
      const understanding = await analyze_video_with_audio(projectId || "", location, model, tempFilePath);
      understandings = { understanding };
    } else if (contentType === "audio/mp3") {
      // Process audio files
      console.log("[processFileUpload] Processing audio file");
      const tempFilePath = `/tmp/${filePath.split("/").pop()}`;
      await file.download({ destination: tempFilePath });
      const understanding: any = await transcript_audio(projectId || "", location, model, tempFilePath);
      const chunks = await chunkText(understanding, 1024 * 1024 * 5);
      understandings = { understanding, chunks };
    } else if (contentType?.startsWith("image/")) {
      // Process image files
      console.log("[processFileUpload] Processing image file");
      const tempFilePath = `/tmp/${filePath.split("/").pop()}`;
      await file.download({ destination: tempFilePath });
      const question = "what is shown in this image?";
      const understanding = await sendMultiModalPromptWithImage(
        projectId || "",
        location,
        model,
        [tempFilePath],
        question
      );
      understandings = { understanding: understanding.fullTextResponse, usageMetadata: understanding.usageMetadata };
    } else if (contentType === "application/vnd.ms-excel" || contentType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
      // Process Excel files
      console.log("[processFileUpload] Processing Excel file");
      const tempFilePath = `/tmp/${filePath.split("/").pop()}`;
      await file.download({ destination: tempFilePath });
      const workbook = XLSX.readFile(tempFilePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      understandings = { understanding: JSON.stringify(jsonData) };
    } else {
      console.log(`[processFileUpload] Unsupported file type: ${contentType}`);
      return;
    }

    // 3. Create Firestore document
    const fileUrl = `gs://${bucket}/${filePath}`;
    const workspaceId = "your-workspace-id"; // Replace with your actual workspace ID
    const ownerId = "your-owner-id"; // Replace with the actual owner ID
    const newUploadData = {
      workspace_id: workspaceId,
      owner_id: ownerId,
      name: filePath.split("/").pop(),
      type: contentType,
      size: fileSize,
      url: fileUrl,
      understanding: understandings.understanding,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
      deleted_at: null,
    };

    // Add a new document in collection "uploads"
    const newUploadRef = await db.collection("uploads").add(newUploadData);
    console.log("[processFileUpload] Upload document created with ID:", newUploadRef.id);

  } catch (error: any) {
    console.error("[processFileUpload] Error processing file:", error);
  }
});
