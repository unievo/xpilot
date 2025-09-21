import { workspaceResolver } from "@core/workspace"
import fs from "fs/promises"
import * as path from "path"
import { HostProvider } from "@/hosts/host-provider"

const IS_WINDOWS = /^win/.test(process.platform)

/**
 * Asynchronously creates all non-existing subdirectories for a given file path
 * and collects them in an array for later deletion.
 *
 * @param filePath - The full path to a file.
 * @returns A promise that resolves to an array of newly created directories.
 */
export async function createDirectoriesForFile(filePath: string): Promise<string[]> {
	const newDirectories: string[] = []
	const normalizedFilePath = path.normalize(filePath) // Normalize path for cross-platform compatibility
	const directoryPath = path.dirname(normalizedFilePath)

	let currentPath = directoryPath
	const dirsToCreate: string[] = []

	// Traverse up the directory tree and collect missing directories
	while (!(await fileExistsAtPath(currentPath))) {
		dirsToCreate.push(currentPath)
		currentPath = path.dirname(currentPath)
	}

	// Create directories from the topmost missing one down to the target directory
	for (let i = dirsToCreate.length - 1; i >= 0; i--) {
		await fs.mkdir(dirsToCreate[i])
		newDirectories.push(dirsToCreate[i])
	}

	return newDirectories
}

/**
 * Helper function to check if a path exists.
 *
 * @param path - The path to check.
 * @returns A promise that resolves to true if the path exists, false otherwise.
 */
export async function fileExistsAtPath(filePath: string): Promise<boolean> {
	try {
		await fs.access(filePath)
		return true
	} catch {
		return false
	}
}

/**
 * Checks if the path is a directory
 * @param filePath - The path to check.
 * @returns A promise that resolves to true if the path is a directory, false otherwise.
 */
export async function isDirectory(filePath: string): Promise<boolean> {
	try {
		const stats = await fs.stat(filePath)
		return stats.isDirectory()
	} catch {
		return false
	}
}

/**
 * Gets the size of a file in kilobytes
 * @param filePath - Path to the file to check
 * @returns Promise<number> - Size of the file in KB, or 0 if file doesn't exist
 */
export async function getFileSizeInKB(filePath: string): Promise<number> {
	try {
		const stats = await fs.stat(filePath)
		const fileSizeInKB = stats.size / 1000 // Convert bytes to KB (decimal) - matches OS file size display
		return fileSizeInKB
	} catch {
		return 0
	}
}

/**
 * Writes content to a file
 * @param filePath - Absolute path to the file
 * @param content - Content to write (string or Uint8Array)
 * @param encoding - Text encoding (default: 'utf8')
 * @returns A promise that resolves when the file is written
 */
export async function writeFile(
	filePath: string,
	content: string | Uint8Array,
	encoding: BufferEncoding = "utf8",
): Promise<void> {
	console.log("[DEBUG] writing file:", filePath, content.length, encoding)
	if (content instanceof Uint8Array) {
		await fs.writeFile(filePath, content)
	} else {
		await fs.writeFile(filePath, content, encoding)
	}
}

// Common OS-generated files that would appear in an otherwise clean directory
const OS_GENERATED_FILES = [
	".DS_Store", // macOS Finder
	"Thumbs.db", // Windows Explorer thumbnails
	"desktop.ini", // Windows folder settings
]

/**
 * Recursively reads a directory and returns an array of absolute file paths.
 *
 * @param directoryPath - The path to the directory to read.
 * @param excludedPaths - Nested array of paths to ignore.
 * @param excludedDirectories - Array of strings to exclude directories containing them in their names.
 * @param excludedFiles - Array of strings to exclude files containing them in their filenames.
 * @returns A promise that resolves to an array of absolute file paths.
 * @throws Error if the directory cannot be read.
 */
export const readDirectory = async (
	directoryPath: string,
	excludedPaths: string[][] = [],
	excludedDirectories: string[] = [],
	excludedFiles: string[] = [],
): Promise<string[]> => {
	const filePaths: string[] = []

	/**
	 * Helper function to check if a directory should be excluded
	 */
	const shouldExcludeDirectory = (dirPath: string, dirName: string): boolean => {
		// Check excludedPaths
		if (excludedPaths.length > 0) {
			for (const excludedPathList of excludedPaths) {
				const pathToSearchFor = path.sep + excludedPathList.join(path.sep) + path.sep
				if (dirPath.includes(pathToSearchFor)) {
					return true
				}
			}
		}

		// Check excludedDirectories
		if (excludedDirectories.length > 0) {
			const isInExcludedDirectory = excludedDirectories.some((excludedDir) => {
				// Handle wildcard patterns (e.g., ".git*" matches directories starting with ".git")
				if (excludedDir.endsWith("*")) {
					const prefix = excludedDir.slice(0, -1) // Remove the '*'
					return dirName.startsWith(prefix)
				}
				// Original behavior for non-wildcard patterns
				return dirName.includes(excludedDir)
			})
			if (isInExcludedDirectory) {
				return true
			}
		}

		return false
	}

	/**
	 * Helper function to check if a file should be excluded
	 */
	const shouldExcludeFile = (fileName: string): boolean => {
		// Filter OS-generated files
		if (OS_GENERATED_FILES.includes(fileName)) {
			return true
		}

		// Filter based on excludedFiles
		if (excludedFiles.length > 0) {
			const containsExcludedString = excludedFiles.some((excludedString) => fileName.includes(excludedString))
			if (containsExcludedString) {
				return true
			}
		}

		return false
	}

	/**
	 * Recursively processes a directory
	 */
	const processDirectory = async (currentPath: string): Promise<void> => {
		try {
			const entries = await fs.readdir(currentPath, { withFileTypes: true })

			for (const entry of entries) {
				const entryPath = path.join(currentPath, entry.name)

				if (entry.isDirectory()) {
					// Check if this directory should be excluded before processing it
					if (!shouldExcludeDirectory(entryPath, entry.name)) {
						await processDirectory(entryPath)
					}
				} else if (entry.isFile()) {
					// Check if this file should be excluded
					if (!shouldExcludeFile(entry.name)) {
						const resolvedPath = workspaceResolver.resolveWorkspacePath(
							currentPath,
							entry.name,
							"Utils.fs.readDirectory",
						)
						const absolutePath = typeof resolvedPath === "string" ? resolvedPath : resolvedPath.absolutePath
						filePaths.push(absolutePath)
					}
				}
			}
		} catch (error) {
			throw new Error(`Error reading directory at ${currentPath}: ${error}`)
		}
	}

	try {
		await processDirectory(directoryPath)
		return filePaths
	} catch (error) {
		throw new Error(`Error reading directory at ${directoryPath}: ${error}`)
	}
}

export async function getBinaryLocation(name: string): Promise<string> {
	const binName = IS_WINDOWS ? `${name}.exe` : name
	const location = await HostProvider.get().getBinaryLocation(binName)

	if (!(await fileExistsAtPath(location))) {
		throw new Error(`Could not find binary ${name} at: ${location}`)
	}
	return location
}
