"use client"
import Image, { type StaticImageData } from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Img1 from "@/public/assets/images/swiper/pink-slider.png"
import Img2 from "@/public/assets/images/swiper/slider4.png"
import Img3 from "@/public/assets/images/swiper/slider5.png"
import { useState, useEffect } from "react"

const images = [
  { 
    id: 1, 
    url: Img1,
    title: "Summer Sale",
    subtitle: "Up to 50% off on all car parts",
    buttonText: "Shop Now",
    link: "/browse"
  },
  { 
    id: 2, 
    url: Img2,
    title: "New Arrivals",
    subtitle: "Check out the latest gadgets for your ride",
    buttonText: "Explore",
    link: "/browse"
  },
  { 
    id: 3, 
    url: Img3,
    title: "Premium Wheels",
    subtitle: "Upgrade your style with our premium selection",
    buttonText: "View Collection",
    link: "/browse"
  },
]

export default function HomeMainSwiper() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  const [touchEndX, setTouchEndX] = useState<number | null>(null)

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

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.touches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) {
      setTouchStartX(null)
      setTouchEndX(null)
      return
    }

    const diff = touchStartX - touchEndX
    const threshold = 50 // px
    if (Math.abs(diff) > threshold) {
      if (diff > 0) goToNextSlide()
      else goToPrevSlide()
    }

    setTouchStartX(null)
    setTouchEndX(null)
  }

  return (
    <div className="relative w-full overflow-hidden rounded-lg shadow-lg group">
      {/* Slides */}
      <div
        className="relative w-full h-[300px] sm:h-[350px] md:h-[400px]"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ touchAction: "pan-y pinch-zoom" }}
      >
        {images.map((img, index) => (
          <div
            key={img.id}
            className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <Image
              src={img.url || "/placeholder.svg"}
              alt={`Slide ${img.id}`}
              fill
              priority={index === 0}
              className="object-cover object-center w-full h-full"
              placeholder="blur"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
            />
            
            {/* Modern Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent sm:bg-gradient-to-r sm:from-black/80 sm:via-transparent sm:to-transparent" />

            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-end p-6 pb-16 sm:justify-center sm:items-start sm:p-12 md:p-16">
              <div className={`transform transition-all duration-700 ease-out flex flex-col items-start ${index === currentSlide ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
                <span className="inline-block px-3 py-1 mb-3 text-xs font-bold tracking-wider text-white uppercase bg-pink-primary/90 rounded-full backdrop-blur-sm">
                  Featured
                </span>
                <h2 className="text-white text-4xl sm:text-5xl md:text-6xl font-black italic uppercase tracking-tighter mb-3 drop-shadow-xl leading-none">
                  {img.title}
                </h2>
                <p className="text-gray-200 text-sm sm:text-lg mb-6 max-w-md font-medium drop-shadow-md leading-relaxed">
                  {img.subtitle}
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    asChild 
                    size="lg"
                    className="rounded-full px-8 py-6 text-base sm:text-lg font-bold bg-white text-black hover:bg-white/90 hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.3)] border-2 border-transparent hover:border-pink-primary"
                  >
                    <Link href={img.link}>
                      {img.buttonText}
                    </Link>
                  </Button>
                  <Button 
                    asChild 
                    size="lg"
                    className="rounded-full px-8 py-6 text-base sm:text-lg font-bold bg-gradient-to-r from-pink-600 to-rose-600 text-white hover:from-pink-700 hover:to-rose-700 hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_0_20px_rgba(255,23,68,0.4)] border-2 border-transparent"
                  >
                    <Link href="/subscriptions">
                      Become A Seller
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination dots */}
      <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-1 sm:gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 rounded-full border border-white/70 transition-colors ${
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

