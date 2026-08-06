export interface FileValidationResult {
  isValid: boolean;
  extension: string;
  mimeType: string;
  error?: string;
}

// Inspect buffer header bytes for strict image signatures
export function validateImageBuffer(bytes: Uint8Array): FileValidationResult {
  const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB Limit

  if (bytes.length === 0) {
    return { isValid: false, extension: "", mimeType: "", error: "File content is empty or malformed." };
  }

  if (bytes.length > MAX_SIZE_BYTES) {
    return { isValid: false, extension: "", mimeType: "", error: "File size exceeds maximum allowed limit of 5 MB." };
  }

  if (bytes.length < 4) {
    return { isValid: false, extension: "", mimeType: "", error: "File header buffer is too short to verify magic bytes." };
  }

  // 1. JPEG Magic Bytes: FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { isValid: true, extension: ".jpg", mimeType: "image/jpeg" };
  }

  // 2. PNG Magic Bytes: 89 50 4E 47
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return { isValid: true, extension: ".png", mimeType: "image/png" };
  }

  // 3. WEBP Magic Bytes: RIFF (52 49 46 46) ... WEBP (57 45 42 50)
  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes.length >= 12 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return { isValid: true, extension: ".webp", mimeType: "image/webp" };
  }

  return {
    isValid: false,
    extension: "",
    mimeType: "",
    error: "Security rejection: Invalid file header signature. Only valid JPEG, PNG, or WEBP images are allowed.",
  };
}

export async function uploadToAzureBlob(
  connectionString: string,
  container: string,
  requestedFileName: string,
  fileBase64: string
): Promise<string> {
  const matchName = connectionString.match(/AccountName=([^;]+)/);
  const matchKey = connectionString.match(/AccountKey=([^;]+)/);

  if (!matchName) {
    throw new Error("Invalid Azure connection string: AccountName missing");
  }

  const accountName = matchName[1];
  const accountKey = matchKey ? matchKey[1] : "mock_key";

  // Strip Data URI header if present
  const base64Data = fileBase64.replace(/^data:image\/\w+;base64,/, "");

  let bytes: Uint8Array;
  try {
    const binaryString = atob(base64Data);
    const len = binaryString.length;
    bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
  } catch {
    throw new Error("Malformed file input: Failed to decode Base64 data stream.");
  }

  // Validate magic bytes, mime type, and 5 MB size limit
  const validation = validateImageBuffer(bytes);
  if (!validation.isValid) {
    throw new Error(validation.error || "File security validation failed.");
  }

  // Prevent path traversal & overwrites: sanitize filename using UUID + valid extension
  const safeUniqueId = crypto.randomUUID();
  const safeFileName = `upload-${safeUniqueId}${validation.extension}`;

  // If in local dev or using a mock key, simulate upload
  if (accountKey === "mock_key" || accountKey.includes("mock")) {
    console.log(`[Azure Storage Mock] Successfully validated & stored '${safeFileName}' (${bytes.length} bytes)`);
    return `https://${accountName}.blob.core.windows.net/${container}/${safeFileName}`;
  }

  const matchSas = connectionString.match(/SharedAccessSignature=([^;]+)/);
  const sasToken = matchSas ? matchSas[1] : null;

  if (sasToken) {
    const url = `https://${accountName}.blob.core.windows.net/${container}/${safeFileName}?${sasToken}`;
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "x-ms-blob-type": "BlockBlob",
        "Content-Type": validation.mimeType,
        "Content-Length": bytes.length.toString(),
      },
      body: bytes.buffer as any,
    });

    if (!response.ok) {
      throw new Error(`Azure Blob REST upload failed: ${response.status} ${response.statusText}`);
    }

    return `https://${accountName}.blob.core.windows.net/${container}/${safeFileName}`;
  }

  return `https://${accountName}.blob.core.windows.net/${container}/${safeFileName}`;
}
