import fs from "fs"
import path from "path"

// Directory containing the .vue files
// const directoryPath = '/Users/peetstander/Projects/omni/layers/omni-layout-topnav/components' // Change this to your directory path
const directoryPath = "/Users/peetstander/Projects/empire/layers/shared/components/global" // Change this to your directory path

// Function to rename files
const renameFiles = () => {
  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      return console.error("Unable to scan directory: " + err)
    }

    // Loop through all the files
    files.forEach((file) => {
      // Check if the file starts with 'Demo' and ends with '.vue'
      if (file.startsWith("Tairo") && file.endsWith(".vue")) {
        // New file name without 'Demo'
        const newFileName = file.replace(/^Tairo/, "")

        // Full paths for the old and new file names
        const oldFilePath = path.join(directoryPath, file)
        const newFilePath = path.join(directoryPath, newFileName)

        // Rename the file
        fs.rename(oldFilePath, newFilePath, (err) => {
          if (err) {
            console.error("Error renaming file: " + err)
          } else {
            console.log(`Renamed: ${file} -> ${newFileName}`)
          }
        })
      }
    })
  })
}

// Execute the function
renameFiles()
