import React from "react";
import TeamMembers from "./TeamMembers";
import ImageCarousel from "./ImageCarousel";

const AboutContact = ({ theme }) => {
  return (
    <div className="container-fluid p-0">
      <ImageCarousel theme={theme} />

      <div className="container py-5">
        <div className="text-center mb-5">
          <h1 className="display-5 mb-3" style={{ fontWeight: 600 }}>
            Bhumitra CFE
          </h1>
          <p className="lead mx-auto mb-0" style={{ maxWidth: "42rem", color: theme.muted }}>
            Welcome to Bhumitra CFE (Citizens For Environment). We work toward environmental conservation and sustainable
            living through eco-friendly products, workshops, and community programmes.
          </p>
          <div className="row g-4 mt-5">
            <div className="col-md-4">
              <div
                className="p-4 h-100 rounded-4"
                style={{
                  backgroundColor: theme.surface || theme.cardBackground,
                  border: `1px solid ${theme.borderColor}`,
                }}
              >
                <h2 className="h5 mb-2" style={{ color: theme.primary }}>
                  Environmental impact
                </h2>
                <p className="small mb-0" style={{ color: theme.muted }}>
                  Sustainable solutions and learning for all ages.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div
                className="p-4 h-100 rounded-4"
                style={{
                  backgroundColor: theme.surface || theme.cardBackground,
                  border: `1px solid ${theme.borderColor}`,
                }}
              >
                <h2 className="h5 mb-2" style={{ color: theme.primary }}>
                  Eco-friendly products
                </h2>
                <p className="small mb-0" style={{ color: theme.muted }}>
                  Safer alternatives to common household chemicals.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div
                className="p-4 h-100 rounded-4"
                style={{
                  backgroundColor: theme.surface || theme.cardBackground,
                  border: `1px solid ${theme.borderColor}`,
                }}
              >
                <h2 className="h5 mb-2" style={{ color: theme.primary }}>
                  Community
                </h2>
                <p className="small mb-0" style={{ color: theme.muted }}>
                  Drives and workshops that bring people together.
                </p>
              </div>
            </div>
          </div>
        </div>

        <TeamMembers theme={theme} />

        <div className="row mt-5 pb-4">
          <div className="col-md-8 mx-auto">
            <div
              className="rounded-4 p-4 p-md-5"
              style={{
                backgroundColor: theme.surface || theme.cardBackground,
                color: theme.text,
                border: `1px solid ${theme.borderColor}`,
                boxShadow: `0 8px 32px ${theme.shadow}`,
              }}
            >
              <h2 className="h4 mb-4 text-center">Contact</h2>
              <div className="row g-4">
                <div className="col-md-6">
                  <h3 className="h6 text-uppercase small" style={{ color: theme.primary }}>
                    Address
                  </h3>
                  <p className="mb-0" style={{ color: theme.muted }}>
                    Noida sector-62
                    <br />
                    201301
                  </p>
                </div>
                <div className="col-md-6">
                  <h3 className="h6 text-uppercase small" style={{ color: theme.primary }}>
                    Email
                  </h3>
                  <p className="mb-3" style={{ color: theme.muted }}>
                    bhumitracfe@gmail.com
                  </p>
                  <h3 className="h6 text-uppercase small" style={{ color: theme.primary }}>
                    Phone
                  </h3>
                  <p className="mb-0" style={{ color: theme.muted }}>
                    +91 99233-49767
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutContact;
