import React, { useState, useEffect } from "react";

const ImageCarousel = ({ theme }) => {
  const slides = [
    {
      image: "/carousel/community.jpg",
      title: "Environmental conservation",
      description: "Working together to protect our surroundings",
    },
    {
      image: "/carousel/products.jpg",
      title: "Sustainable living",
      description: "Eco-friendly choices for everyday life",
    },
    {
      image: "/carousel/event.jpg",
      title: "Community impact",
      description: "Workshops and drives that make a difference",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5500);
    return () => clearInterval(interval);
  }, [slides.length]);

  const overlayBg =
    theme?.name === "dark"
      ? "linear-gradient(transparent, rgba(10, 22, 16, 0.92))"
      : "linear-gradient(transparent, rgba(42, 51, 45, 0.82))";

  return (
    <div
      className="position-relative overflow-hidden w-100"
      style={{
        height: "min(70vh, 520px)",
        minHeight: "320px",
        backgroundColor: theme?.surface || "#0d1f14",
      }}
    >
      {slides.map((slide, index) => (
        <div
          key={slide.image}
          className="position-absolute w-100 h-100"
          style={{
            opacity: index === currentIndex ? 1 : 0,
            transition: "opacity 0.6s ease",
            top: 0,
            left: 0,
            pointerEvents: index === currentIndex ? "auto" : "none",
          }}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="w-100 h-100"
            style={{ objectFit: "cover", objectPosition: "center" }}
          />
          <div
            className="position-absolute bottom-0 w-100 px-3 py-4 py-md-5"
            style={{
              background: overlayBg,
              color: "#f5f0e6",
            }}
          >
            <div className="container">
              <h2 className="h3 fw-semibold mb-2">{slide.title}</h2>
              <p className="mb-0 opacity-90">{slide.description}</p>
            </div>
          </div>
        </div>
      ))}
      <div className="position-absolute bottom-0 start-50 translate-middle-x mb-4 d-flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            type="button"
            className="rounded-circle border-0 p-0"
            style={{
              width: "10px",
              height: "10px",
              background: index === currentIndex ? "#f5f0e6" : "rgba(245,240,230,0.45)",
              cursor: "pointer",
            }}
            onClick={() => setCurrentIndex(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageCarousel;
