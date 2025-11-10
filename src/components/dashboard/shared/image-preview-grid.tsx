// React, Next.js
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import Image from "next/image";

// Import of the image shown when there are no images available
import NoImageImg from "../../../../public/assets/images/no_image_2.png";

// Utils
import { cn, getDominantColors, getGridClassName } from "@/lib/utils";

//Icons
import { Trash } from "lucide-react";
import ColorPalette from "./color-palette";

interface ImagesPreviewGridProps {
  images: { url: string }[]; // Array of image URLs
  onRemove: (value: string) => void; // Callback function when an image is removed
  colors?: { color: string }[]; // List of colors from form
  setColors: Dispatch<SetStateAction<{ color: string }[]>>; // Setter function for colors
}

const ImagesPreviewGrid = ({
  images,
  onRemove,
  colors,
  setColors,
}: ImagesPreviewGridProps) => {
  // Calculate the number of images
  const imagesLength = images.length;

  // Get the grid class name based on the number of images
  const GridClassName = getGridClassName(imagesLength);

  // Extract images colors
  const [colorPalettes, setColorPalettes] = useState<string[][]>([]);
  useEffect(() => {
    const fecthColors = async () => {
      const palettes = await Promise.all(
        images.map(async (img) => {
          try {
            const colors = await getDominantColors(img.url);
            return colors;
          } catch {
            return [];
          }
        })
      );
      setColorPalettes(palettes);
    };

    if (imagesLength > 0) {
      fecthColors();
    }
  }, [images, imagesLength]);

  console.log("colorPalettes--->", colorPalettes);

  // If there are no images, display a placeholder image
  if (imagesLength === 0) {
    return (
      <div>
        <Image
          src={NoImageImg}
          alt="No images available"
          width={200}
          height={240}
          className="rounded-md"
        />
      </div>
    );
  } else {
    // If there are images, display the images in a grid
    return (
      <div className="max-w-4xl">
        <div
          className={cn(
            "grid h-[300px] overflow-hidden rounded-md bg-white",
            GridClassName
          )}
        >
          {images.map((img, i) => (
            <div
              key={i}
              className={cn(
                "relative group h-full w-full overflow-visible border border-gray-300",
                `grid_${imagesLength}_image_${i + 1}`,
                {
                  "h-[120px]": images.length >= 5,
                }
              )}
            >
              {/* Image */}
              <Image
                src={img.url}
                alt=""
                width={800}
                height={800}
                className="h-full w-full object-cover object-top"
              />
              {/* Actions Floating Button Group - Top Right Corner */}
              <div
                className="absolute -top-1 -right-1 z-30 hidden flex-col items-end gap-1 rounded-lg bg-white/95 p-2 shadow-lg backdrop-blur-sm transition-all duration-300 group-hover:flex"
              >
                {/* Color palette (Extract colors) */}
                <ColorPalette
                  colors={colors}
                  setColors={setColors}
                  extractedColors={colorPalettes[i]}
                />
                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => onRemove(img.url)}
                  className="inline-flex items-center gap-1 rounded-full bg-red-500 px-2 py-1 text-[10px] font-semibold text-white shadow-sm transition hover:bg-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                >
                  <Trash className="h-3 w-3" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
};

export default ImagesPreviewGrid;