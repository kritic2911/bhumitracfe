import React, { useState, useEffect, useCallback } from "react";
import { themes } from "../themes";
import "./ProductCatalog.css";

// ─── helpers ────────────────────────────────────────────────────────────────

const pid = (p) => p.product_id ?? p.id;

const getProductImages = (product) => {
  if (product.images && product.images.length > 0) {
    return product.images.map((img) => (typeof img === "string" ? img : img.image));
  }
  if (product.image) return [product.image];
  return [];
};

// ─── SVG arrow icons ─────────────────────────────────────────────────────────

const ChevronLeft = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ChevronRight = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

// ─── Component ───────────────────────────────────────────────────────────────

const ProductCatalog = ({ theme, products: productsProp }) => {
  const defaults = [
    {
      product_id: 1, id: 1,
      name: "Bhumizyme, the Bio-Enzyme Cleaner",
      price: "₹199/L",
      description: "Multipurpose floor, tile, and toilet cleaner from natural ingredients. Safe for children and pets.",
      image: "/products/bhumizyme.jpg",
      images: [],
      quantities: [],
    },
    {
      product_id: 2, id: 2,
      name: "UpCycled Cloth Bags",
      price: "₹49-69",
      description: "Reusable cotton bags from upcycled fabric to cut down single-use plastic.",
      image: "/products/cloth_bags.jpg",
      images: [],
      quantities: [],
    },
    {
      product_id: 3, id: 3,
      name: "Bio-Enzyme activator",
      price: "₹249",
      description: "Activator plus guidance to brew bio-enzyme at home.",
      image: "/products/activator.jpg",
      images: [],
      quantities: [],
    },
  ];

  const products = productsProp?.length ? productsProp : defaults;

  // ── state ──────────────────────────────────────────────────────────────────
  const [activeIdx, setActiveIdx] = useState(0);       // which product card is focused
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [carouselIdx, setCarouselIdx] = useState(0);   // image within expanded product
  const [selectedQty, setSelectedQty] = useState(null); // chosen quantity option

  // ── product-level navigation (circular) ───────────────────────────────────
  const prevProduct = useCallback(() => {
    setActiveIdx((i) => (i === 0 ? products.length - 1 : i - 1));
  }, [products.length]);

  const nextProduct = useCallback(() => {
    setActiveIdx((i) => (i === products.length - 1 ? 0 : i + 1));
  }, [products.length]);

  // Arrow-key navigation on the catalog page (not when overlay is open)
  useEffect(() => {
    if (selectedProduct) return;
    const onKey = (e) => {
      if (e.key === "ArrowLeft")  prevProduct();
      if (e.key === "ArrowRight") nextProduct();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedProduct, prevProduct, nextProduct]);

  // ── expanded product overlay ───────────────────────────────────────────────
  const openProduct = (product) => {
    setCarouselIdx(0);
    setSelectedQty(null);
    setSelectedProduct(product);
  };

  const closeProduct = () => setSelectedProduct(null);

  // Escape closes the overlay
  useEffect(() => {
    if (!selectedProduct) return;
    const onKey = (e) => { if (e.key === "Escape") closeProduct(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProduct]);

  // ── image carousel inside overlay ─────────────────────────────────────────
  const baseImages = selectedProduct ? getProductImages(selectedProduct) : [];
  const quantities  = selectedProduct?.quantities || [];

  // If a qty with an image is selected, show that image first; else show base images
  const overlayImages = (() => {
    if (selectedQty && selectedQty.image) {
      return [selectedQty.image, ...baseImages.filter((img) => img !== selectedQty.image)];
    }
    return baseImages;
  })();

  const hasMany = overlayImages.length > 1;

  const prevImage = (e) => {
    e.stopPropagation();
    setCarouselIdx((i) => (i === 0 ? overlayImages.length - 1 : i - 1));
  };
  const nextImage = (e) => {
    e.stopPropagation();
    setCarouselIdx((i) => (i === overlayImages.length - 1 ? 0 : i + 1));
  };

  // When qty changes, reset carousel to 0 so the qty image shows immediately
  const pickQty = (qty) => {
    if (selectedQty?.label === qty.label) {
      setSelectedQty(null); // toggle off
    } else {
      setSelectedQty(qty);
      setCarouselIdx(0);
    }
  };

  // ── theme helpers ──────────────────────────────────────────────────────────
  const isDark     = theme === themes.dark;
  const btnText    = isDark ? "#0a1610" : "#fffcf7";
  const surface    = theme.surface || theme.cardBackground;

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div className="container py-5">
      <h2 className="h3 text-center mb-2" style={{ fontWeight: 600 }}>Products</h2>
      <p className="text-center mb-5 small" style={{ color: theme.muted, maxWidth: "36rem", margin: "0 auto 2rem" }}>
        Sustainable picks for everyday use. Tap a product to view details.
      </p>

      {/* ── Catalog row with left/right navigation ── */}
      <div className="catalog-nav-row">
        {/* Left arrow */}
        <button
          type="button"
          className="catalog-nav-arrow catalog-nav-arrow--left"
          onClick={prevProduct}
          aria-label="Previous product"
          style={{ color: theme.text, backgroundColor: surface, border: `1px solid ${theme.borderColor}` }}
        >
          <ChevronLeft size={24} />
        </button>

        {/* Product grid */}
        <div className="row row-cols-1 row-cols-md-3 g-4 catalog-grid">
          {products.map((product, idx) => {
            const prodImages = getProductImages(product);
            const thumb      = prodImages[0] || "/products/activator.jpg";
            const isActive   = idx === activeIdx;
            return (
              <div key={pid(product)} className="col">
                <div
                  className={`card h-100 product-card border-0 rounded-4 overflow-hidden${isActive ? " product-card--active" : ""}`}
                  style={{
                    backgroundColor: surface,
                    color: theme.text,
                    border: isActive
                      ? `2px solid ${theme.primary}`
                      : `1px solid ${theme.borderColor}`,
                    boxShadow: isActive
                      ? `0 8px 32px ${theme.shadow}, 0 0 0 3px ${theme.primary}22`
                      : `0 6px 28px ${theme.shadow}`,
                    cursor: "pointer",
                  }}
                  onClick={() => { setActiveIdx(idx); openProduct(product); }}
                  onKeyDown={(e) => e.key === "Enter" && openProduct(product)}
                  role="button"
                  tabIndex={0}
                  aria-label={`View details for ${product.name}`}
                >
                  <div className="product-image-container">
                    <img src={thumb} className="product-image" alt="" />
                    <div className="price-tag" style={{ backgroundColor: theme.primary, color: btnText }}>
                      {product.price}
                    </div>
                    {/* Qty badge */}
                    {product.quantities?.length > 0 && (
                      <div className="qty-badge">
                        {product.quantities.length} size{product.quantities.length !== 1 ? "s" : ""}
                      </div>
                    )}
                  </div>
                  <div className="card-body">
                    <h3 className="h6 card-title">{product.name}</h3>
                    <p className="card-text small mb-0" style={{ color: theme.muted }}>{product.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right arrow */}
        <button
          type="button"
          className="catalog-nav-arrow catalog-nav-arrow--right"
          onClick={nextProduct}
          aria-label="Next product"
          style={{ color: theme.text, backgroundColor: surface, border: `1px solid ${theme.borderColor}` }}
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Dot indicators */}
      <div className="catalog-dots">
        {products.map((_, i) => (
          <button
            key={i}
            type="button"
            className={`catalog-dot${i === activeIdx ? " catalog-dot--active" : ""}`}
            style={{ backgroundColor: i === activeIdx ? theme.primary : theme.borderColor }}
            onClick={() => setActiveIdx(i)}
            aria-label={`Go to product ${i + 1}`}
          />
        ))}
      </div>

      {/* ── Expanded product overlay ── */}
      {selectedProduct && (
        <div className="product-overlay" onClick={closeProduct} role="presentation">
          <div
            className="product-expanded-tile"
            style={{ backgroundColor: surface, color: theme.text, border: `1px solid ${theme.borderColor}`, boxShadow: `0 16px 64px ${theme.shadow}` }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button type="button" className="product-expanded-close" onClick={closeProduct} aria-label="Close product details" style={{ color: theme.muted }}>
              ✕
            </button>

            {/* ── Image carousel ── */}
            {overlayImages.length > 0 && (
              <div className="product-carousel">
                {hasMany && (
                  <button type="button" className="carousel-arrow carousel-arrow-left" onClick={prevImage} aria-label="Previous image"
                    style={{ color: theme.text, backgroundColor: surface }}>
                    <ChevronLeft />
                  </button>
                )}
                <div className="carousel-image-wrapper">
                  <img
                    src={overlayImages[carouselIdx]}
                    alt={`${selectedProduct.name} — view ${carouselIdx + 1}`}
                    className="carousel-current-image"
                    key={overlayImages[carouselIdx]}  /* remount triggers fade */
                  />
                </div>
                {hasMany && (
                  <button type="button" className="carousel-arrow carousel-arrow-right" onClick={nextImage} aria-label="Next image"
                    style={{ color: theme.text, backgroundColor: surface }}>
                    <ChevronRight />
                  </button>
                )}
                {hasMany && (
                  <div className="carousel-dots">
                    {overlayImages.map((_, i) => (
                      <span
                        key={i}
                        className={`carousel-dot ${i === carouselIdx ? "active" : ""}`}
                        style={{ backgroundColor: i === carouselIdx ? theme.primary : theme.borderColor }}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Product info ── */}
            <div className="product-expanded-info">
              <h3 className="product-expanded-name">{selectedProduct.name}</h3>
              <p className="product-expanded-price" style={{ color: theme.primary }}>
                {selectedQty?.price ? `${selectedQty.label}: ${selectedQty.price}` : `Price: ${selectedProduct.price}`}
              </p>

              {/* ── Quantity selector ── */}
              {quantities.length > 0 && (
                <div className="qty-selector">
                  <p className="qty-selector-label" style={{ color: theme.muted }}>Available sizes / quantities:</p>
                  <div className="qty-chips">
                    {quantities.map((qty) => {
                      const isChosen = selectedQty?.label === qty.label;
                      return (
                        <button
                          key={qty.label}
                          type="button"
                          className={`qty-chip${isChosen ? " qty-chip--active" : ""}`}
                          style={{
                            backgroundColor: isChosen ? theme.primary : "transparent",
                            color: isChosen ? btnText : theme.text,
                            borderColor: isChosen ? theme.primary : theme.borderColor,
                          }}
                          onClick={() => pickQty(qty)}
                          title={qty.image ? "Click to see packaging" : qty.label}
                        >
                          {qty.label}
                          {qty.image && (
                            <span className="qty-chip-img-hint" aria-hidden="true">📦</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {selectedQty && (
                    <p className="qty-chip-hint" style={{ color: theme.muted }}>
                      {selectedQty.image
                        ? "↑ Packaging image shown above"
                        : "No packaging image for this size yet"}
                    </p>
                  )}
                </div>
              )}

              <p className="product-expanded-desc" style={{ color: theme.muted }}>{selectedProduct.description}</p>
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
