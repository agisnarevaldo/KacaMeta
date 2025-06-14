import { v4 as uuidv4 } from "uuid";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

export async function uploadImage(imageBase64: string): Promise<string> {
  try {
    // Remove data URL prefix if present (e.g., "data:image/png;base64,")
    const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");
    
    const imageBuffer = Buffer.from(base64Data, "base64");
    const imageName = `${uuidv4()}.png`;
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    const imagePath = path.join(uploadsDir, imageName);

    // Ensure uploads directory exists
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    await writeFile(imagePath, imageBuffer);

    return `/uploads/${imageName}`;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw new Error("Failed to upload image");
  }
}
