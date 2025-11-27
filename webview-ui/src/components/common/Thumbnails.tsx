import { iconHighlightColor } from "@components/config"
import { cn } from "@heroui/react"
import { StringRequest } from "@shared/proto/cline/common"
import React, { memo, useLayoutEffect, useRef, useState } from "react"
import { useWindowSize } from "react-use"
import { FileServiceClient } from "@/services/grpc-client"

interface ThumbnailsProps {
	images: string[]
	files: string[]
	style?: React.CSSProperties
	setImages?: React.Dispatch<React.SetStateAction<string[]>>
	setFiles?: React.Dispatch<React.SetStateAction<string[]>>
	onHeightChange?: (height: number) => void
	className?: string
}

const Thumbnails = ({ images, files, style, setImages, setFiles, onHeightChange, className }: ThumbnailsProps) => {
	const [hoveredIndex, setHoveredIndex] = useState<string | null>(null)
	const containerRef = useRef<HTMLDivElement>(null)
	const { width } = useWindowSize()

	useLayoutEffect(() => {
		if (containerRef.current) {
			let height = containerRef.current.clientHeight
			// some browsers return 0 for clientHeight
			if (!height) {
				height = containerRef.current.getBoundingClientRect().height
			}
			onHeightChange?.(height)
		}
		setHoveredIndex(null)
	}, [images, files, width, onHeightChange])

	const handleDeleteImages = (index: number) => {
		setImages?.((prevImages) => prevImages.filter((_, i) => i !== index))
	}

	const handleDeleteFiles = (index: number) => {
		setFiles?.((prevFiles) => prevFiles.filter((_, i) => i !== index))
	}

	const isDeletableImages = setImages !== undefined
	const isDeletableFiles = setFiles !== undefined

	const handleImageClick = (image: string) => {
		FileServiceClient.openImage(StringRequest.create({ value: image })).catch((err) =>
			console.error("Failed to open image:", err),
		)
	}

	const handleFileClick = (filePath: string) => {
		FileServiceClient.openFile(StringRequest.create({ value: filePath })).catch((err) =>
			console.error("Failed to open file:", err),
		)
	}

	return (
		<div
			className={cn("flex flex-wrap", className)}
			ref={containerRef}
			style={{
				gap: 5,
				rowGap: 3,
				...style,
			}}>
			{images.map((image, index) => {
				const _imageName = image.split(/[\\/]/).pop() || `image-${index + 1}`

				return (
					<div
						key={`image-${index}`}
						onMouseLeave={() => setHoveredIndex(null)}
						onMouseMove={() => setHoveredIndex(`image-${index}`)}
						style={{ marginLeft: -0, position: "relative", overflow: "hidden" }}>
						<div
							onClick={() => handleImageClick(image)}
							style={{
								minWidth: 30,
								height: 20,
								paddingRight: 3,
								paddingTop: 3,
								paddingBottom: 3,
								borderRadius: 4,
								cursor: "pointer",
								border: "1px solid var(--vscode-checkbox-border)",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
							}}>
							{hoveredIndex === `image-${index}` && isDeletableImages ? (
								<span
									className="codicon codicon-close"
									onClick={(e) => {
										e.stopPropagation()
										handleDeleteImages(index)
									}}
									style={{
										fontSize: 14,
										paddingRight: 2,
										color: "var(--vscode-textColor)",
									}}></span>
							) : (
								<img
									alt={`Thumbnail`}
									src={image}
									style={{
										width: 16,
										height: 16,
										objectFit: "cover",
										borderRadius: 2,
										marginRight: 2,
									}}
								/>
							)}
							<span
								style={{
									fontSize: 10,
									opacity: 0.8,
									marginTop: 1,
									overflow: "hidden",
									textOverflow: "ellipsis",
									whiteSpace: "nowrap",
									textAlign: "center",
								}}
								title="Image">
								image
							</span>
						</div>
					</div>
				)
			})}

			{files.map((filePath, index) => {
				const fileName = filePath.split(/[\\/]/).pop() || filePath

				return (
					<div
						key={`file-${index}`}
						onMouseLeave={() => setHoveredIndex(null)}
						onMouseMove={() => setHoveredIndex(`file-${index}`)}>
						{/* style={{ position: "relative", overflow: "hidden" }} */}
						<div
							onClick={() => handleFileClick(filePath)}
							style={{
								minWidth: 30,
								height: 20,
								paddingRight: 3,
								paddingTop: 3,
								paddingBottom: 3,
								borderRadius: 4,
								cursor: "pointer",
								//backgroundColor: "var(--vscode-editor-background)",
								border: "1px solid var(--vscode-checkbox-border)",
								display: "flex",
								//flexDirection: "column",
								alignItems: "center",
								justifyContent: "center",
							}}>
							<span
								className={`codicon ${hoveredIndex === `file-${index}` && isDeletableFiles ? "codicon-close" : "codicon-file"}`}
								onClick={
									hoveredIndex === `file-${index}` && isDeletableFiles
										? (e) => {
												e.stopPropagation()
												handleDeleteFiles(index)
											}
										: undefined
								}
								style={{
									fontSize: 12,
									paddingRight: 2,
									color:
										hoveredIndex === `file-${index}` && isDeletableFiles
											? "var(--vscode-textColor)"
											: iconHighlightColor,
								}}></span>
							<span
								style={{
									fontSize: 10,
									opacity: 0.8,
									marginTop: 1,
									overflow: "hidden",
									textOverflow: "ellipsis",
									whiteSpace: "nowrap",
									textAlign: "center",
								}}
								title={fileName}>
								{fileName}
							</span>
						</div>
						{/* Removed separate delete button since icon now handles deletion */}
					</div>
				)
			})}
		</div>
	)
}

export default memo(Thumbnails)
