import React, { useState } from "react";
import { themes } from "../themes";
import "./ProductCatalog.css";

const ProductCatalog = ({ theme, products: productsProp }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  const defaults = [
    {
      product_id: 1,
      id: 1,
      name: "Bhumizyme, the Bio-Enzyme Cleaner",
      price: "₹199/L",
      description:
        "Multipurpose floor, tile, and toilet cleaner from natural ingredients. Safe for children and pets.",
      image: "/products/bhumizyme.jpg",
    },
    {
      product_id: 2,
      id: 2,
      name: "UpCycled Cloth Bags",
      price: "₹49-69",
      description: "Reusable cotton bags from upcycled fabric to cut down single-use plastic.",
      image: "/products/cloth_bags.jpg",
    },
    {
      product_id: 3,
      id: 3,
      name: "Bio-Enzyme activator",
      price: "₹249",
      description: "Activator plus guidance to brew bio-enzyme at home.",
      image: "/products/activator.jpg",
    },
  ];

  const products = productsProp?.length ? productsProp : defaults;

  const pid = (p) => p.product_id ?? p.id;

  return (
    <div className="container py-5">
      <h2 className="h3 text-center mb-2" style={{ fontWeight: 600 }}>
        Products
      </h2>
      <p className="text-center mb-5 small" style={{ color: theme.muted, maxWidth: "36rem", margin: "0 auto 2rem" }}>
        Sustainable picks for everyday use. Tap an image to enlarge.
      </p>
      <div className="row row-cols-1 row-cols-md-3 g-4">
        {products.map((product) => (
          <div key={pid(product)} className="col">
            <div
              className="card h-100 product-card border-0 rounded-4 overflow-hidden"
              style={{
                backgroundColor: theme.surface || theme.cardBackground,
                color: theme.text,
                border: `1px solid ${theme.borderColor}`,
                boxShadow: `0 6px 28px ${theme.shadow}`,
              }}
            >
              <div
                className="product-image-container"
                onClick={() => setSelectedImage(product.image)}
                onKeyDown={(e) => e.key === "Enter" && setSelectedImage(product.image)}
                role="button"
                tabIndex={0}
                aria-label={`Enlarge image for ${product.name}`}
              >
                <img src={product.image} className="product-image" alt="" />
                <div
                  className="price-tag"
                  style={{
                    backgroundColor: theme.primary,
                    color: theme === themes.dark ? "#0a1610" : "#fffcf7",
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
        ))}
      </div>

      {selectedImage && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedImage(null)}
          role="presentation"
        >
          <img src={selectedImage} alt="" className="modal-image" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
};

export default ProductCatalog;
