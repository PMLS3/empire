import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
console.log(__dirname)
// const sourceDir = path.join(__dirname, './layers/documentation');
const sourceDir = "/Users/peetstander/Projects/empire/.demo/components"
const destinationDir = "/Users/peetstander/Projects/empire/layers/shared/components"

// const destinationDir = path.join(__dirname, "./shared/omni/server")

function copyRecursively(source, destination) {
  // Create destination directory if it doesn't exist
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true })
  }

  // Read contents of source directory
  const files = fs.readdirSync(source)

  files.forEach((file) => {
    const sourcePath = path.join(source, file)
    const destinationPath = path.join(destination, file)

    // Check if it's a directory
    if (fs.statSync(sourcePath).isDirectory()) {
      // Recursively copy subdirectory
      copyRecursively(sourcePath, destinationPath)
    } else {
      // Copy file
      fs.copyFileSync(sourcePath, destinationPath)
      console.log(`Copied: ${sourcePath} -> ${destinationPath}`)
    }
  })
}

// Start the recursive copy process
copyRecursively(sourceDir, destinationDir)