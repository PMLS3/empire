import { Tool } from "@langchain/core/tools";
import { LoaderHandler } from "../loaders";
import logger from "../logger";
import type { Peer } from "crossws";

/**
 * Tool for processing PDF files to extract text content and structure
 */
export class PDFProcessorTool extends Tool {
  name = "pdf_processor";
  description = "Process PDF files to extract text content and structure";
  peer?: Peer;

  constructor(peer?: Peer) {
    super();
    this.peer = peer;
  }

  /**
   * Process a PDF file and extract its content
   * @param input JSON string with parameters: filePath, chunkSize, chunkOverlap, logProgress
   * @returns JSON string with the processing result
   */
  async _call(input: string): Promise<string> {
    try {
      const args = JSON.parse(input);
      const { filePath, chunkSize, chunkOverlap, logProgress } = args;

      if (!filePath) {
        throw new Error("filePath is required");
      }

      if (logProgress && this.peer) {
        logger.info({ message: `Starting PDF processing for: ${filePath}` }, this.peer);
      }

      const loader = new LoaderHandler({
        type: "pdf",
        source: filePath,
        splitPages: true,
      });

      // If chunking is requested
      if (chunkSize) {
        if (logProgress && this.peer) {
          logger.info(
            { message: `Chunking PDF with size ${chunkSize} and overlap ${chunkOverlap || 200}` },
            this.peer
          );
        }

        const result = await loader.loadAndSplit(chunkSize, chunkOverlap || 200);
        
        if (logProgress && this.peer) {
          logger.info(
            { message: `PDF processing complete. Extracted ${result.documents?.length || 0} chunks.` },
            this.peer
          );
        }
        
        return JSON.stringify(result);
      }

      // Otherwise just load the document
      const result = await loader.load();
      
      if (logProgress && this.peer) {
        logger.info(
          { message: `PDF processing complete. Extracted ${result.documents?.length || 0} pages.` },
          this.peer
        );
      }
      
      return JSON.stringify(result);
    } catch (error) {
      if (this.peer) {
        logger.error(
          { message: `Error processing PDF: ${error instanceof Error ? error.message : String(error)}` },
          this.peer
        );
      }
      
      return JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}

/**
 * Tool for batch processing multiple PDF files
 */
export class BatchPDFProcessorTool extends Tool {
  name = "batch_pdf_processor";
  description = "Process multiple PDF files to extract text content and structure";
  peer?: Peer;

  constructor(peer?: Peer) {
    super();
    this.peer = peer;
  }

  /**
   * Process multiple PDF files and extract their content
   * @param input JSON string with parameters: filePaths, chunkSize, chunkOverlap, logProgress
   * @returns JSON string with the processing results
   */
  async _call(input: string): Promise<string> {
    try {
      const args = JSON.parse(input);
      const { filePaths, chunkSize, chunkOverlap, logProgress } = args;

      if (!filePaths || !Array.isArray(filePaths) || filePaths.length === 0) {
        throw new Error("filePaths array is required and must not be empty");
      }

      if (logProgress && this.peer) {
        logger.info(
          { message: `Starting batch PDF processing for ${filePaths.length} files` },
          this.peer
        );
      }

      const results = [];
      let successCount = 0;
      let failureCount = 0;

      for (let i = 0; i < filePaths.length; i++) {
        const filePath = filePaths[i];
        
        if (logProgress && this.peer) {
          logger.info(
            { message: `Processing file ${i + 1}/${filePaths.length}: ${filePath}` },
            this.peer
          );
        }

        try {
          const loader = new LoaderHandler({
            type: "pdf",
            source: filePath,
            splitPages: true,
          });

          // If chunking is requested
          let result;
          if (chunkSize) {
            result = await loader.loadAndSplit(chunkSize, chunkOverlap || 200);
          } else {
            // Otherwise just load the document
            result = await loader.load();
          }

          results.push({
            filePath,
            ...result,
            success: result.success !== false, // Override only if it's false
          });
          
          successCount++;
        } catch (fileError) {
          results.push({
            filePath,
            success: false,
            error: fileError instanceof Error ? fileError.message : "Unknown error",
          });
          
          failureCount++;
          
          if (this.peer) {
            logger.error(
              { message: `Error processing file ${filePath}: ${fileError instanceof Error ? fileError.message : String(fileError)}` },
              this.peer
            );
          }
        }
      }

      if (logProgress && this.peer) {
        logger.info(
          { message: `Batch PDF processing complete. Success: ${successCount}, Failures: ${failureCount}` },
          this.peer
        );
      }

      return JSON.stringify({
        success: true,
        totalFiles: filePaths.length,
        successCount,
        failureCount,
        results,
      });
    } catch (error) {
      if (this.peer) {
        logger.error(
          { message: `Error in batch PDF processing: ${error instanceof Error ? error.message : String(error)}` },
          this.peer
        );
      }
      
      return JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}

/**
 * Tool for extracting metadata from PDF files
 */
export class PDFMetadataExtractorTool extends Tool {
  name = "pdf_metadata_extractor";
  description = "Extract metadata from PDF files such as title, author, creation date, etc.";
  peer?: Peer;

  constructor(peer?: Peer) {
    super();
    this.peer = peer;
  }

  /**
   * Extract metadata from a PDF file
   * @param input JSON string with parameters: filePath, logProgress
   * @returns JSON string with the metadata extraction result
   */
  async _call(input: string): Promise<string> {
    try {
      const args = JSON.parse(input);
      const { filePath, logProgress } = args;

      if (!filePath) {
        throw new Error("filePath is required");
      }

      if (logProgress && this.peer) {
        logger.info(
          { message: `Starting PDF metadata extraction for: ${filePath}` },
          this.peer
        );
      }

      const loader = new LoaderHandler({
        type: "pdf",
        source: filePath,
        splitPages: false,
      });

      const result = await loader.load();
      
      // Extract metadata from the first document
      const metadata = result.documents && result.documents.length > 0 
        ? result.documents[0].metadata 
        : {};
      
      if (logProgress && this.peer) {
        logger.info(
          { message: `PDF metadata extraction complete for: ${filePath}` },
          this.peer
        );
      }
      
      return JSON.stringify({
        success: true,
        filePath,
        metadata,
      });
    } catch (error) {
      if (this.peer) {
        logger.error(
          { message: `Error extracting PDF metadata: ${error instanceof Error ? error.message : String(error)}` },
          this.peer
        );
      }
      
      return JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}
