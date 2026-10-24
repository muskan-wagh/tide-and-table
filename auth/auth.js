"use strict";

const SUPABASE_URL = "https://eqebnwpzbszjdntbjbpw.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_zMAsFQHJfrIkaZFQi5wlDQ_5qtEa8du";

const authForm = document.getElementById("authForm");
const authMessage = document.getElementById("authMessage");
const submitBtn = document.getElementById("submitBtn");
const page = document.body.dataset.page;

const fields = {
  fullName: document.getElementById("fullName"),
  email: document.getElementById("email"),
  password: document.getElementById("password"),
  confirmPassword: document.getElementById("confirmPassword"),
};

let supabase = null;

function showMessage(message, type = "info") {
  authMessage.textContent = message;
  authMessage.className = `message ${type}`;
  authMessage.hidden = false;
}

function clearMessage() {
  authMessage.textContent = "";
  authMessage.hidden = true;
  authMessage.className = "message";
}

function setFieldError(fieldName, message) {
  const input = fields[fieldName];
  const error = document.getElementById(`${fieldName}Error`);

  if (input) {
    input.setAttribute("aria-invalid", String(Boolean(message)));
  }

  if (error) {
    error.textContent = message;
  }
}

function clearFieldErrors() {
  Object.keys(fields).forEach((fieldName) => {
    setFieldError(fieldName, "");
  });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateForm() {
  clearFieldErrors();
  clearMessage();

  let valid = true;

  if (page === "register") {
    const fullName = fields.fullName?.value.trim() || "";

    if (fullName.length < 2) {
      setFieldError("fullName", "Please enter your full name.");
      valid = false;
    }
  }

  const email = fields.email?.value.trim() || "";

  if (!isValidEmail(email)) {
    setFieldError("email", "Please enter a valid email address.");
    valid = false;
  }

  const password = fields.password?.value || "";

  if (!password) {
    setFieldError("password", "Please enter your password.");
    valid = false;
  } else if (page === "register" && password.length < 8) {
    setFieldError("password", "Use at least 8 characters.");
    valid = false;
  }

  if (
    page === "register" &&
    password !== (fields.confirmPassword?.value || "")
  ) {
    setFieldError("confirmPassword", "Passwords do not match.");
    valid = false;
  }

  return valid;
}

// Initialize Supabase.
async function initializeSupabase() {
  submitBtn.disabled = true;

  try {
    const { createClient } =
      await import("https://esm.sh/@supabase/supabase-js@2");

    supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

    const { data, error } = await supabase.auth.getSession();

    if (error) throw error;
    submitBtn.disabled = false;
  } catch (error) {
    console.error("Supabase initialization failed:", error);
    showMessage(
      "Unable to connect to authentication. Check your internet connection and Supabase configuration.",
      "error",
    );
    submitBtn.disabled = true;
  }
}

// Password visibility toggle.
document.querySelectorAll("[data-toggle]").forEach((button) => {
  button.addEventListener("click", () => {
    const input = document.getElementById(button.dataset.toggle);
    if (!input) return;

    const shouldShow = input.type === "password";
    input.type = shouldShow ? "text" : "password";
    button.textContent = shouldShow ? "Hide" : "Show";
    button.setAttribute(
      "aria-label",
      shouldShow ? "Hide password" : "Show password",
    );
  });
});

// Clear errors while the user types.
Object.entries(fields).forEach(([fieldName, input]) => {
  if (!input) return;

  input.addEventListener("input", () => {
    setFieldError(fieldName, "");
    clearMessage();

    if (
      page === "register" &&
      (fieldName === "password" || fieldName === "confirmPassword") &&
      fields.confirmPassword
    ) {
      setFieldError(
        "confirmPassword",
        fields.password.value === fields.confirmPassword.value
          ? ""
          : "Passwords do not match.",
      );
    }
  });
});

// Signup and login.
authForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!validateForm()) {
    showMessage("Please correct the highlighted fields.", "error");
    return;
  }

  if (!supabase) {
    showMessage("Authentication is not ready. Please try again.", "error");
    return;
  }

  submitBtn.disabled = true;
  const originalText = submitBtn.textContent;
  submitBtn.textContent =
    page === "register" ? "Creating account..." : "Signing in...";

  try {
    const email = fields.email.value.trim();
    const password = fields.password.value;

    if (page === "register") {
      const fullName = fields.fullName.value.trim();

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: new URL("login.html", window.location.href).href,
        },
      });

      if (error) throw error;

      if (data.session) {
        if (data.session) {
          showMessage(
            "Account created successfully! Redirecting...",
            "success",
          );

          setTimeout(() => {
            window.location.replace("../olive_ember_restaurant_website.html");
          }, 1500);
        } else {
          authForm.reset();
          clearFieldErrors();

          showMessage(
            "Account created! Please check your email and confirm your account before signing in.",
            "success",
          );
        }
      } else {
        authForm.reset();
        clearFieldErrors();
        showMessage(
          "Account created! Please check your email and confirm your account before signing in.",
          "success",
        );
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      showMessage("Login successful! Redirecting...", "success");

      window.setTimeout(() => {
        window.location.replace("../olive_ember_restaurant_website.html");
      }, 800);
    }
  } catch (error) {
    console.error("Authentication error:", error);

    let message = error.message || "Something went wrong. Please try again.";

    if (message.toLowerCase().includes("invalid login credentials")) {
      message = "Incorrect email or password.";
    } else if (message.toLowerCase().includes("email not confirmed")) {
      message = "Please confirm your email before signing in.";
    } else if (message.toLowerCase().includes("already registered")) {
      message = "An account with this email may already exist. Try signing in.";
    }

    showMessage(message, "error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
});

// Password recovery will be connected in a later phase.
const forgotPassword = document.getElementById("forgotPassword");

if (forgotPassword) {
  forgotPassword.addEventListener("click", (event) => {
    event.preventDefault();
    showMessage(
      "Password recovery will be connected in the next phase.",
      "info",
    );
  });
}

initializeSupabase();
