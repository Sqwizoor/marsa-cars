"use client"

import type React from "react"

import { CldUploadWidget } from "next-cloudinary"
import { useCallback } from "react"


import { Button } from "@/components/ui/button"
import { PhoneOutgoingIcon } from "lucide-react"
import Image from "next/image"

interface ImageUploadProps {
  onChange: (value: string) => void
  onRemove: (value: string) => void
  value: string[]
  disabled?: boolean
}

const ImageUpload = ({
  onChange,
  onRemove,
  value,
  disabled,
}: ImageUploadProps) => {
  type CloudinaryUpload = { info?: { secure_url?: string } }
  const handleUpload = useCallback(
    (result: unknown) => {
      const r = result as CloudinaryUpload
      const url = r?.info?.secure_url
      if (typeof url === "string" && url.length > 0) {
        onChange(url)
      }
    },
    [onChange],
  )

  return (
    <div>
      <div className="mb-4 flex items-center gap-4">
        {value.map((url) => (
          <div key={url} className="relative w-[200px] h-[200px]">
            <Image className="object-cover" fill src={url || "/placeholder.svg"} alt="Upload" />
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

