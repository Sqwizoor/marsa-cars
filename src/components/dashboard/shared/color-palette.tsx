// React
import { Dispatch, FC, SetStateAction } from "react";

// Pros definition
interface ColorPaletteProps {
  extractedColors?: string[]; // Extracted Colors (Array of strings)
  colors?: { color: string }[]; // List of selected colors from form
  setColors: Dispatch<SetStateAction<{ color: string }[]>>; // Setter function for colors
}

// ColorPalette component for displaying a color palette
const ColorPalette: FC<ColorPaletteProps> = ({
  colors,
  extractedColors,
  setColors,
}) => {
  // Handle Selecting/ Adding color to product colors
  const handleAddProductColor = (color: string) => {
    if (!color || !setColors) return;

    // Ensure colorsData is not undefined, defaulting to an empty array if it is
    const currentColorsData = colors ?? [];

    // Check if the color already exists in colorsData
    const existingColor = currentColorsData.find((c) => color === c.color);
    if (existingColor) return;

    // Check for empty inputs and remove them
    const newColors = currentColorsData.filter((c) => c.color !== "");
    // Add the new color to colorsData
    setColors([...newColors, { color: color }]);
  };

  if (!extractedColors?.length) {
    return null;
  }

  return (
    <div className="pointer-events-auto flex flex-wrap items-center justify-end gap-1">
      {extractedColors.map((color) => (
        <button
          key={color}
          type="button"
          className="h-6 w-6 rounded-full border-2 border-gray-300 shadow-sm transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-gray-600"
          style={{ backgroundColor: color }}
          onClick={() => handleAddProductColor(color)}
          aria-label={`Add color ${color}`}
          title={color}
        />
      ))}
    </div>
  );
};

export default ColorPalette;