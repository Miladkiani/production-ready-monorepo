/**
 * Upload Client for REST API
 * Provides type-safe methods for uploading files to the backend
 */

/**
 * Response type for single file upload
 */
export interface UploadResponse {
  url: string;
  filename: string;
  size: number;
}

/**
 * Response type for multiple file upload
 */
export interface MultiUploadResponse {
  urls: string[];
  filenames: string[];
  totalSize: number;
}

/**
 * Response type for file deletion
 */
export interface DeleteResponse {
  success: boolean;
}

/**
 * Upload client configuration
 */
export interface UploadClientConfig {
  baseUrl?: string;
}

/**
 * Upload Client Class
 * Handles all file upload operations to the REST API
 */
export class UploadClient {
  private baseUrl: string;
  private isServer: boolean;
  private accessToken: string | null = null;

  constructor(config: UploadClientConfig = {}) {
    // CRITICAL: Determine if we're on server or client
    this.isServer = typeof window === "undefined";

    if (config.baseUrl) {
      // Explicit baseUrl provided
      this.baseUrl = config.baseUrl;
    } else if (this.isServer) {
      // SERVER-SIDE: Use internal backend URL (Docker network)
      // In production: admin container → backend:4000 (internal network, no /api prefix)
      // In development: localhost:4000
      // IMPORTANT: Backend routes are /upload/* (no /api prefix in backend)
      const internalUrl = process.env.API_URL || "http://localhost:4000";
      this.baseUrl = internalUrl;
    } else {
      // CLIENT-SIDE: Use NEXT_PUBLIC_API_URL (browser makes requests to public URL)
      // Example: browser → cloudflare → nginx → backend
      // Nginx strips /api prefix before forwarding
      const envUrl = process.env.NEXT_PUBLIC_API_URL || "";
      this.baseUrl = envUrl.startsWith("http") ? envUrl : "";
    }
  }

  /**
   * Get the correct endpoint path based on execution context
   * Server-side: /upload/* (direct to backend, no /api prefix)
   * Client-side: /api/upload/* (through nginx, which strips /api)
   */
  private getEndpoint(path: string): string {
    if (this.isServer) {
      // Server-side: remove /api prefix (backend routes don't have it)
      return path.replace(/^\/api/, "");
    }
    // Client-side: keep /api prefix (nginx will strip it)
    return path;
  }

  /**
   * Get authorization headers for upload requests
   * Client-side: Token should be passed via setAccessToken() method
   * Server-side: Get token from Authorization header (set by middleware)
   *
   * NOTE: In Next.js 15, middleware sets cookies on RESPONSE which are NOT
   * available to Server Components via cookies() in the SAME request cycle.
   * However, headers set via requestHeaders ARE available via headers().
   */
  private async getAuthHeaders(): Promise<HeadersInit> {
    if (this.isServer) {
      // Server-side: Get access token from Authorization header (set by middleware)
      try {
        const { headers } = await import("next/headers");
        const headersList = await headers();
        const authHeader = headersList.get("authorization");

        if (!authHeader) {
          console.warn(
            "[UploadClient] No Authorization header in server context",
          );
          return {};
        }

        return {
          Authorization: authHeader,
        };
      } catch (error) {
        console.error("[UploadClient] Failed to get headers on server:", error);
        return {};
      }
    }

    // Client-side: Use the stored access token
    if (this.accessToken) {
      return {
        Authorization: `Bearer ${this.accessToken}`,
      };
    }

    console.warn("[UploadClient] No access token set for client-side upload");
    return {};
  }

  /**
   * Set access token for client-side requests
   * Call this before making upload requests from client components
   *
   * @example
   * const { accessToken } = useAuth();
   * uploadClient.setAccessToken(accessToken);
   * await uploadClient.uploadAvatar(file);
   */
  setAccessToken(token: string | null): void {
    this.accessToken = token;
  }

  /**
   * Upload avatar image
   * @param file - Image file (max 5MB)
   * @returns Upload response with URL
   */
  async uploadAvatar(file: File): Promise<UploadResponse> {
    return this.uploadSingleFile(this.getEndpoint("/api/upload/avatar"), file);
  }

  /**
   * Upload resume PDF
   * @param file - PDF file (max 10MB)
   * @returns Upload response with URL
   */
  async uploadResume(file: File): Promise<UploadResponse> {
    return this.uploadSingleFile(this.getEndpoint("/api/upload/resume"), file);
  }

  /**
   * Upload article image
   * @param file - Image file (max 5MB)
   * @returns Upload response with URL
   */
  async uploadArticleImage(file: File): Promise<UploadResponse> {
    return this.uploadSingleFile(
      this.getEndpoint("/api/upload/article-image"),
      file,
    );
  }

  /**
   * Upload social icon/logo
   * @param file - Image file (max 2MB)
   * @returns Upload response with URL
   */
  async uploadSocialIcon(file: File): Promise<UploadResponse> {
    return this.uploadSingleFile(
      this.getEndpoint("/api/upload/social-icon"),
      file,
    );
  }

  /**
   * Upload multiple resume page images
   * @param files - Array of image files (max 10 files, 5MB each)
   * @returns Multi-upload response with URLs
   */
  async uploadResumePages(files: File[]): Promise<MultiUploadResponse> {
    return this.uploadMultipleFiles(
      this.getEndpoint("/api/upload/resume-pages"),
      files,
    );
  }

  /**
   * Delete a file by URL
   * @param url - Full URL of the file to delete
   * @returns Success status
   */
  async deleteFile(url: string): Promise<DeleteResponse> {
    // Get authorization headers (token for client-side, empty for server-side)
    const authHeaders = await this.getAuthHeaders();

    const response = await fetch(
      `${this.baseUrl}${this.getEndpoint("/api/upload/file")}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({ url }),
        credentials: "include", // Include cookies for authentication
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Delete failed: ${response.status} - ${errorText}`);

      let errorMessage = "Failed to delete file";
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorMessage;
      } catch {
        errorMessage =
          errorText || `HTTP ${response.status}: ${response.statusText}`;
      }

      throw new Error(errorMessage);
    }

    return response.json();
  }

  /**
   * Private helper: Upload a single file
   */
  private async uploadSingleFile(
    endpoint: string,
    file: File,
  ): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append("file", file);

    // Get authorization headers (token for client-side, empty for server-side)
    const headers = await this.getAuthHeaders();

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "POST",
      body: formData,
      headers,
      credentials: "include", // Include cookies for authentication
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Upload failed: ${response.status} - ${errorText}`);

      let errorMessage = "File upload failed";
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorMessage;
      } catch {
        errorMessage =
          errorText || `HTTP ${response.status}: ${response.statusText}`;
      }

      throw new Error(errorMessage);
    }

    return response.json();
  }

  /**
   * Private helper: Upload multiple files
   */
  private async uploadMultipleFiles(
    endpoint: string,
    files: File[],
  ): Promise<MultiUploadResponse> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    // Get authorization headers (token for client-side, empty for server-side)
    const headers = await this.getAuthHeaders();

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "POST",
      body: formData,
      headers,
      credentials: "include", // Include cookies for authentication
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Upload failed: ${response.status} - ${errorText}`);

      let errorMessage = "File upload failed";
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorMessage;
      } catch {
        errorMessage =
          errorText || `HTTP ${response.status}: ${response.statusText}`;
      }

      throw new Error(errorMessage);
    }

    return response.json();
  }
}

/**
 * Default upload client instance
 */
export const uploadClient = new UploadClient();

/**
 * Convenience methods for direct use
 */
export const uploadAvatar = (file: File) => uploadClient.uploadAvatar(file);
export const uploadResume = (file: File) => uploadClient.uploadResume(file);
export const uploadArticleImage = (file: File) =>
  uploadClient.uploadArticleImage(file);
export const uploadSocialIcon = (file: File) =>
  uploadClient.uploadSocialIcon(file);
export const uploadResumePages = (files: File[]) =>
  uploadClient.uploadResumePages(files);
export const deleteFile = (url: string) => uploadClient.deleteFile(url);

// Alias for uploading PDFs (uses resume endpoint)
export const uploadPdf = (file: File) => uploadClient.uploadResume(file);
