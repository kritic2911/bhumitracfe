import React, { useState, useEffect } from "react";
import { themes } from "../themes";
import "./ProductCatalog.css";

const ProductCatalog = ({ theme, products: productsProp }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [carouselIndex, setCarouselIndex] = useState(0);

  const defaults = [
    {
      product_id: 1,
      id: 1,
      name: "Bhumizyme, the Bio-Enzyme Cleaner",
      price: "₹199/L",
      description:
        "Multipurpose floor, tile, and toilet cleaner from natural ingredients. Safe for children and pets.",
      image: "/products/bhumizyme.jpg",
      images: [],
    },
    {
      product_id: 2,
      id: 2,
      name: "UpCycled Cloth Bags",
      price: "₹49-69",
      description: "Reusable cotton bags from upcycled fabric to cut down single-use plastic.",
      image: "/products/cloth_bags.jpg",
      images: [],
    },
    {
      product_id: 3,
      id: 3,
      name: "Bio-Enzyme activator",
      price: "₹249",
      description: "Activator plus guidance to brew bio-enzyme at home.",
      image: "/products/activator.jpg",
      images: [],
    },
  ];

  const products = productsProp?.length ? productsProp : defaults;

  const pid = (p) => p.product_id ?? p.id;

  // Build the list of images for a product (prefer images array, fall back to single image)
  const getProductImages = (product) => {
    if (product.images && product.images.length > 0) {
      return product.images.map((img) => (typeof img === "string" ? img : img.image));
    }
    if (product.image) return [product.image];
    return [];
  };

  const openProduct = (product) => {
    setCarouselIndex(0);
    setSelectedProduct(product);
  };

  const closeProduct = () => {
    setSelectedProduct(null);
  };

  // Close on Escape key
  useEffect(() => {
    if (!selectedProduct) return;
    const handleKey = (e) => {
      if (e.key === "Escape") closeProduct();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProduct]);

  const images = selectedProduct ? getProductImages(selectedProduct) : [];
  const hasMultipleImages = images.length > 1;

  const prevImage = (e) => {
    e.stopPropagation();
    setCarouselIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextImage = (e) => {
    e.stopPropagation();
    setCarouselIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const isDark = theme === themes.dark;
  const btnTextColor = isDark ? "#0a1610" : "#fffcf7";

  return (
    <div className="container py-5">
      <h2 className="h3 text-center mb-2" style={{ fontWeight: 600 }}>
        Products
      </h2>
      <p className="text-center mb-5 small" style={{ color: theme.muted, maxWidth: "36rem", margin: "0 auto 2rem" }}>
        Sustainable picks for everyday use. Tap a product to view details.
      </p>
      <div className="row row-cols-1 row-cols-md-3 g-4">
        {products.map((product) => {
          const prodImages = getProductImages(product);
          const thumbImage = prodImages[0] || "/products/activator.jpg";
          return (
            <div key={pid(product)} className="col">
              <div
                className="card h-100 product-card border-0 rounded-4 overflow-hidden"
                style={{
                  backgroundColor: theme.surface || theme.cardBackground,
                  color: theme.text,
                  border: `1px solid ${theme.borderColor}`,
                  boxShadow: `0 6px 28px ${theme.shadow}`,
                  cursor: "pointer",
                }}
                onClick={() => openProduct(product)}
                onKeyDown={(e) => e.key === "Enter" && openProduct(product)}
                role="button"
                tabIndex={0}
                aria-label={`View details for ${product.name}`}
              >
                <div className="product-image-container">
                  <img src={thumbImage} className="product-image" alt="" />
                  <div
                    className="price-tag"
                    style={{
                      backgroundColor: theme.primary,
                      color: btnTextColor,
                    }}
                  >
                    {product.price}
                  </div>
                </div>
                <div className="card-body">
                  <h3 className="h6 card-title">{product.name}</h3>
                  <p className="card-text small mb-0" style={{ color: theme.muted }}>
                    {product.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ---- Expanded product overlay ---- */}
      {selectedProduct && (
        <div
          className="product-overlay"
          onClick={closeProduct}
          role="presentation"
        >
          <div
            className="product-expanded-tile"
            style={{
              backgroundColor: theme.surface || theme.cardBackground,
              color: theme.text,
              border: `1px solid ${theme.borderColor}`,
              boxShadow: `0 16px 64px ${theme.shadow}`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              className="product-expanded-close"
              onClick={closeProduct}
              aria-label="Close product details"
              style={{ color: theme.muted }}
            >
              ✕
            </button>

            {/* Image carousel */}
            {images.length > 0 && (
              <div className="product-carousel">
                {hasMultipleImages && (
                  <button
                    type="button"
                    className="carousel-arrow carousel-arrow-left"
                    onClick={prevImage}
                    aria-label="Previous image"
                    style={{ color: theme.text, backgroundColor: theme.surface || theme.cardBackground }}
                  >
                    ‹
                  </button>
                )}
                <div className="carousel-image-wrapper">
                  <img
                    src={images[carouselIndex]}
                    alt={`${selectedProduct.name} — view ${carouselIndex + 1}`}
                    className="carousel-current-image"
                  />
                </div>
                {hasMultipleImages && (
                  <button
                    type="button"
                    className="carousel-arrow carousel-arrow-right"
                    onClick={nextImage}
                    aria-label="Next image"
                    style={{ color: theme.text, backgroundColor: theme.surface || theme.cardBackground }}
                  >
                    ›
                  </button>
                )}
                {hasMultipleImages && (
                  <div className="carousel-dots">
                    {images.map((_, i) => (
                      <span
                        key={i}
                        className={`carousel-dot ${i === carouselIndex ? "active" : ""}`}
                        style={{
                          backgroundColor: i === carouselIndex ? theme.primary : theme.borderColor,
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Product info */}
            <div className="product-expanded-info">
              <h3 className="product-expanded-name">{selectedProduct.name}</h3>
              <p className="product-expanded-price" style={{ color: theme.primary }}>
                Price: {selectedProduct.price}
              </p>
              <p className="product-expanded-desc" style={{ color: theme.muted }}>
                {selectedProduct.description}
              </p>
              <p className="product-expanded-contact" style={{ color: theme.textSecondary || theme.muted }}>
                *For purchase, please contact us on WhatsApp:{" "}
                <strong>[9923349767]</strong> or Instagram:{" "}
                <strong>[@bhumitra_]</strong>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductCatalog;
