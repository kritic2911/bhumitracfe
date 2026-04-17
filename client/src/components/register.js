import React, { useState } from "react";
import { API_URL } from "../api";
import { themes } from "../themes";

const Register = ({ theme }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile_no: "",
    feedback: "",
    purchase: "",
    other_purchase: "",
  });

  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState("");
  const [errorText, setErrorText] = useState("");
  const [showOtherPurchase, setShowOtherPurchase] = useState(false);

  const purchaseOptions = [
    "Bhumizyme - The BioEnzyme Cleaner",
    "Upcycled Cloth Bags",
    "Bhumizyme Activator",
    "Workshop",
    "NA",
    "Other",
  ];

  const { name, email, mobile_no, feedback, purchase, other_purchase } = formData;

  const validateForm = () => {
    const newErrors = {};

    if (name.length < 2) {
      newErrors.name = "Name must be at least 2 characters long";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    const mobileRegex = /^\d{10}$/;
    if (!mobileRegex.test(mobile_no)) {
      newErrors.mobile_no = "Please enter a valid 10-digit mobile number";
    }

    if (!purchase) {
      newErrors.purchase = "Please select an option";
    }

    if (purchase === "Other" && !other_purchase) {
      newErrors.other_purchase = "Please specify your interest";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onChange = (e) => {
    const { name: field, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (field === "purchase") {
      setShowOtherPurchase(value === "Other");
      if (value !== "Other") {
        setFormData((prev) => ({ ...prev, other_purchase: "" }));
      }
    }

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus("");
    setErrorText("");

    if (!validateForm()) {
      setSubmitStatus("validation-error");
      return;
    }

    try {
      setSubmitStatus("submitting");
      const submitData = {
        ...formData,
        purchase: purchase === "Other" ? other_purchase : purchase,
      };

      let response;
      try {
        response = await fetch(`${API_URL}/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(submitData),
        });
      } catch (err) {
        throw new Error(
          `Network request failed to ${API_URL}/register. ${
            err && err.message ? err.message : String(err)
          }`
        );
      }

      const data = await response.json();
      if (response.ok) {
        setSubmitStatus("success");
        setFormData({
          name: "",
          email: "",
          mobile_no: "",
          feedback: "",
          purchase: "",
          other_purchase: "",
        });
        setShowOtherPurchase(false);
        setTimeout(() => setSubmitStatus(""), 4000);
      } else {
        setSubmitStatus("error");
        console.error("Registration failed:", data.error);
        setErrorText(data.error || "Registration failed");
      }
    } catch (err) {
      console.error(err.message);
      setSubmitStatus("error");
      setErrorText(err.message || "Registration failed");
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: "520px" }}>
      <h1 className="h3 text-center mb-4" style={{ fontWeight: 600 }}>
        Register
      </h1>
      <p className="small text-center mb-4" style={{ color: theme.muted }}>
        Share your interest in products or workshops. We will get back to you.
      </p>
      {submitStatus === "success" && (
        <div className="alert py-2 px-3 mb-3 rounded-3" style={{ backgroundColor: theme.accentWash, border: "none", color: theme.primary }}>
          Thank you — registration received.
        </div>
      )}
      {submitStatus === "error" && (
        <div className="alert alert-danger py-2 px-3 mb-3 rounded-3" role="alert">
          Something went wrong. Please try again.
          {errorText ? <div className="small mt-1">{errorText}</div> : null}
        </div>
      )}
      <form onSubmit={onSubmit}>
        <div className="mb-3">
          <input
            type="text"
            className={`form-control rounded-3 ${errors.name ? "is-invalid" : ""}`}
            placeholder="Full name"
            name="name"
            value={name}
            onChange={onChange}
            required
            style={{
              backgroundColor: theme.surface || theme.cardBackground,
              color: theme.text,
              borderColor: theme.borderColor,
            }}
          />
          {errors.name && <div className="invalid-feedback">{errors.name}</div>}
        </div>
        <div className="mb-3">
          <input
            type="email"
            className={`form-control rounded-3 ${errors.email ? "is-invalid" : ""}`}
            placeholder="Email"
            name="email"
            value={email}
            onChange={onChange}
            required
            style={{
              backgroundColor: theme.surface || theme.cardBackground,
              color: theme.text,
              borderColor: theme.borderColor,
            }}
          />
          {errors.email && <div className="invalid-feedback">{errors.email}</div>}
        </div>
        <div className="mb-3">
          <input
            type="tel"
            className={`form-control rounded-3 ${errors.mobile_no ? "is-invalid" : ""}`}
            placeholder="10-digit mobile"
            name="mobile_no"
            value={mobile_no}
            onChange={onChange}
            required
            style={{
              backgroundColor: theme.surface || theme.cardBackground,
              color: theme.text,
              borderColor: theme.borderColor,
            }}
          />
          {errors.mobile_no && <div className="invalid-feedback">{errors.mobile_no}</div>}
        </div>
        <div className="mb-3">
          <select
            className={`form-select rounded-3 ${errors.purchase ? "is-invalid" : ""}`}
            name="purchase"
            value={purchase}
            onChange={onChange}
            required
            style={{
              backgroundColor: theme.surface || theme.cardBackground,
              color: theme.text,
              borderColor: theme.borderColor,
            }}
          >
            <option value="">Interest</option>
            {purchaseOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {errors.purchase && <div className="invalid-feedback">{errors.purchase}</div>}
        </div>
        {showOtherPurchase && (
          <div className="mb-3">
            <input
              type="text"
              className={`form-control rounded-3 ${errors.other_purchase ? "is-invalid" : ""}`}
              placeholder="Please specify"
              name="other_purchase"
              value={other_purchase}
              onChange={onChange}
              required
              style={{
                backgroundColor: theme.surface || theme.cardBackground,
                color: theme.text,
                borderColor: theme.borderColor,
              }}
            />
            {errors.other_purchase && <div className="invalid-feedback">{errors.other_purchase}</div>}
          </div>
        )}
        <div className="mb-4">
          <textarea
            className="form-control rounded-3"
            placeholder="Feedback (optional)"
            name="feedback"
            value={feedback}
            onChange={onChange}
            rows="3"
            style={{
              backgroundColor: theme.surface || theme.cardBackground,
              color: theme.text,
              borderColor: theme.borderColor,
            }}
          />
        </div>
        <button
          type="submit"
          className="btn w-100 rounded-pill py-2"
          disabled={submitStatus === "submitting"}
          style={{
            backgroundColor: theme.primary,
            borderColor: theme.primary,
            color: theme === themes.dark ? "#0a1610" : "#fffcf7",
          }}
        >
          {submitStatus === "submitting" ? "Sending…" : "Submit"}
        </button>
      </form>
    </div>
  );
};

export default Register;
