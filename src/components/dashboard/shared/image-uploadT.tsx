"use client"

import type React from "react"

import { CldUploadWidget } from "next-cloudinary"
import { useCallback } from "react"


import { Button } from "@/components/ui/button"
import { PhoneOutgoingIcon } from "lucide-react"

interface ImageUploadProps {
  onChange: (value: string) => void
  onRemove: (value: string) => void
  value: string[]
  disabled?: boolean
  type?: string // Make this optional if it's not always required
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onChange,
  onRemove,
  value,
  disabled,
  type = "profile", // Provide a default value
}) => {
  const handleUpload = useCallback(
    (result: any) => {
      onChange(result.info.secure_url)
    },
    [onChange],
  )

  return (
    <div>
      <div className="mb-4 flex items-center gap-4">
        {value.map((url) => (
          <div key={url} className="relative w-[200px] h-[200px]">
            <img className="object-cover w-full h-full" src={url || "/placeholder.svg"} alt="Upload" />
            <div className="absolute top-2 right-2">
              <Button type="button" onClick={() => onRemove(url)} variant="destructive" disabled={disabled}>
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>
      <CldUploadWidget onUpload={handleUpload} uploadPreset="your_preset_here">
        {({ open }) => {
          const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault()
            if (!disabled) {
              open()
            }
          }

          return (
            <Button type="button" disabled={disabled} variant="secondary" onClick={handleClick}>
              <PhoneOutgoingIcon size={24} />
              Upload an Image
            </Button>
          )
        }}
      </CldUploadWidget>
    </div>
  )
}

export default ImageUpload

