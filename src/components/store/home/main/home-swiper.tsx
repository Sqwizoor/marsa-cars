"use client"
import Image, { type StaticImageData } from "next/image"
import Img1 from "@/public/assets/images/swiper/here-slider1.png"
import Img2 from "@/public/assets/images/swiper/here-slider3.png"
import Img3 from "@/public/assets/images/swiper/here-slider2.png"
import { useState, useEffect } from "react"

const images: { id: number; url: StaticImageData }[] = [
  { id: 1, url: Img1 },
  { id: 2, url: Img2 },
  { id: 3, url: Img3 },
]

export default function BasicSwiper() {
  const [currentSlide, setCurrentSlide] = useState(0)

  // Auto-advance slides
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === images.length - 1 ? 0 : prev + 1))
    }, 6000)

    return () => clearInterval(interval)
  }, [])

  // Manual navigation
  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const goToPrevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  return (
    <div className="relative w-full overflow-hidden rounded-lg shadow-lg">
      {/* Slides */}
      <div className="relative w-full h-[200px] sm:h-[240px] md:h-[300px] lg:h-[350px]">
        {images.map((img, index) => (
          <div
            key={img.id}
            className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 flex items-center justify-center ${
              index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <Image
              src={img.url || "/placeholder.svg"}
              alt={`Slide ${img.id}`}
              fill
              priority={index === 0}
              className="object-cover"
              placeholder="blur"
              sizes="100vw"
            />
          </div>
        ))}
      </div>

      {/* Navigation buttons */}
      <button
        onClick={goToPrevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/70 hover:bg-white text-gray-800 p-2 rounded-full"
        aria-label="Previous slide"
      >
        ←
      </button>
      <button
        onClick={goToNextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/70 hover:bg-white text-gray-800 p-2 rounded-full"
        aria-label="Next slide"
      >
        →
      </button>

      {/* Pagination dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
        {images.map((_, index) => (
          <button
            key={index}  
            onClick={() => goToSlide(index)}
            className={`w-2.5 h-2.5 rounded-full border border-white/70 transition-colors ${
              index === currentSlide
                ? "bg-white/90"
                : "bg-white/40 hover:bg-white/60"
            }`}
            aria-current={index === currentSlide}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

