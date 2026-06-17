/**
 * Mohamed Irfan (Rizirfan) Portfolio Javascript Logic
 * Handles interactive animations, navigation, filters, and modal systems.
 */

// Project Data Repository
const projectData = {
  teledrive: {
    title: "TeleDrive",
    desc: "A production-ready cloud storage web application that uses Telegram channels as storage backends. By abstracting storage behind API workers, users never interact with Telegram directly. It persists metadata and message IDs in a PostgreSQL database, uploading and downloading files asynchronously via celery workers.",
    tags: ["Python", "FastAPI", "React", "Tailwind CSS", "Redis", "Docker"],
    image: "assets/teledrive.png",
    github: "https://github.com/Rizirfan/Teledrive",
    features: [
      "Unified Telegram storage provider abstraction layer",
      "Asynchronous chunked upload/download workers",
      "Device tracking, refresh token rotation, and login history logs",
      "Role-Based Access Control (RBAC) for admins and users",
      "Redis task queueing with PostgreSQL metadata persistence"
    ],
    arch: [
      "Backend: Python FastAPI, SQLAlchemy, Alembic, Redis",
      "Frontend: React + TypeScript + Tailwind CSS",
      "Infrastructure: Docker Compose & Nginx Proxy",
      "Storage Backend: Telegram API via Telethon library"
    ]
  },
  "personal-cloud": {
    title: "Multi Drive",
    desc: "Multi Drive (personal-cloud) is a single, aggregated web dashboard that connects multiple Google Drive storage profiles. It provides deep folder breadcrumb navigation, unified query searches across all connected repositories, storage consumption analysis, and encrypted credential sync using Firebase and Upstash Redis.",
    tags: ["JavaScript", "Express", "Firebase", "React", "Vite"],
    image: "assets/multidrive.png",
    github: "https://github.com/Rizirfan/personal-cloud",
    demo: "https://multi-drives.vercel.app/",
    features: [
      "Aggregated personal cloud dashboard across Google profiles",
      "Root search capability that queries across all connected accounts",
      "Dynamic folder traversal with breadcrumb navigation",
      "Secure Firebase Admin JWT session validation",
      "AES-256 token encryption prior to saving to Firestore"
    ],
    arch: [
      "Client UI: React, Vite, and tailwind assets",
      "Backend API: Node.js, Express, and Google Drive API integrations",
      "Authentication & Cache: Firebase Auth and Upstash Redis",
      "Deployment: Render (Backend) and Vercel (Client)"
    ]
  },
  printhub: {
    title: "PrintHub",
    desc: "A secure, streamlined print queue management dashboard that simplifies cloud-coordinated document output. Built with strict TypeScript models to ensure robust state management and API communication workflows.",
    tags: ["TypeScript", "React", "REST API", "State Management"],
    image: "assets/mohd.png",
    github: "https://github.com/Rizirfan/printhub",
    features: [
      "Real-time printer connectivity and queue monitors",
      "OAuth verified user logins and document access controls",
      "Document format validation and upload processing",
      "Comprehensive logs for print activity audits"
    ],
    arch: [
      "Client: React dashboard with customized hooks",
      "Core Logic: TypeScript strict-mode typing and state management",
      "API Integrations: JSON-based RESTful service endpoints"
    ]
  },
  "via-sharing": {
    title: "Via Sharing",
    desc: "A lightning-fast web sharing utility that allows instant file exchanges and link sharing. Designed with clean modular TypeScript classes, offering temporary caching and download progress indications.",
    tags: ["TypeScript", "Tailwind CSS", "Caching", "UX Design"],
    image: "assets/filenest.png",
    github: "https://github.com/Rizirfan/via-sharing",
    features: [
      "Dynamic link generation with optional password security",
      "Clean, minimalist layout for visual appeal and accessibility",
      "Real-time upload and download speed tracker metrics",
      "Configurable file storage TTL (Time-To-Live) cache"
    ],
    arch: [
      "Languages: TypeScript, HTML5, CSS3 styling",
      "Styling framework: Tailwind CSS structure compatibility",
      "Buffer: LocalStorage state cache and in-memory caches"
    ]
  },
  "ihram-essentials": {
    title: "Ihram Essentials",
    desc: "An educational web guide and checklist tool designed to assist pilgrims preparing for Hajj and Umrah. Features custom inventory lists, pack checks, and guide directives to ensure pilgrims prepare their essentials correctly.",
    tags: ["HTML5", "CSS3", "UX / UI", "Mobile Friendly"],
    image: "assets/filenest.png",
    github: "https://github.com/Rizirfan/Ihram-Essentials",
    demo: "https://rizirfan.github.io/Ihram-Essentials/",
    features: [
      "Responsive checklists with persistent local storage",
      "Direct guidelines and procedures categorized by journey phase",
      "Travel checklist print support and offline availability",
      "Highly accessible layout for mobile screens"
    ],
    arch: [
      "Markup: Semantic HTML5 grid components",
      "Styling: Vanilla CSS3 custom styles",
      "Logic: Vanilla JavaScript LocalStorage interface"
    ]
  },
  "crypto-price-checker": {
    title: "Crypto Price Checker",
    desc: "A client-side cryptocurrency price comparison utility. Queries public ticker APIs to present real-time rates, price sparklines, and sorting options in a glassmorphic dashboard.",
    tags: ["HTML5", "CSS Grid", "Vanilla JS", "API Integration"],
    image: "assets/filenest.png",
    github: "https://github.com/Rizirfan/Crypto-price-Checker-",
    demo: "https://rizirfan.github.io/Crypto-price-Checker-/",
    features: [
      "Real-time API currency exchange data streams",
      "Sparkline graphs displaying historical pricing trends",
      "Custom column filtering and sorting rules",
      "Responsive dark glassmorphic dashboard UI styling"
    ],
    arch: [
      "Frontend: HTML5 and CSS Grid layout",
      "API layer: Client-side fetch streams",
      "Logic: ES6 Vanilla JavaScript classes"
    ]
  }
};

document.addEventListener("DOMContentLoaded", () => {
  setupThemeToggle();
  setupNavigation();
  setupProjectsFilter();
  setupModalSystem();
  setupContactForm();
});

/**
 * 1. Navigation Scrolled Styles & Active Link Highlight
 */
function setupNavigation() {
  const header = document.getElementById("header");
  const burger = document.querySelector(".burger");
  const mobileMenu = document.getElementById("mobileMenu");
  const navLinks = document.querySelectorAll(".nav-link");
  const sections = document.querySelectorAll("section");

  // Scroll event for header glow
  window.addEventListener("scroll", () => {
    if (window.scrollY > 40) {
      header.classList.add("header--scrolled");
    } else {
      header.classList.remove("header--scrolled");
    }

    // Scroll active link highlight tracking
    let currentSection = "";
    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (window.scrollY >= sectionTop - 120) {
        currentSection = section.getAttribute("id");
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove("active");
      if (link.getAttribute("href") === `#${currentSection}`) {
        link.classList.add("active");
      }
    });
  });

  // Mobile navigation drawer toggle
  burger.addEventListener("click", () => {
    const isOpen = mobileMenu.classList.toggle("mobile-menu--open");
    burger.classList.toggle("burger--active");
    burger.setAttribute("aria-expanded", isOpen ? "true" : "false");
    mobileMenu.setAttribute("aria-hidden", isOpen ? "false" : "true");
  });

  // Close mobile navigation drawer when link clicked
  mobileMenu.addEventListener("click", (e) => {
    if (e.target.classList.contains("nav-link") || e.target.classList.contains("btn")) {
      mobileMenu.classList.remove("mobile-menu--open");
      burger.classList.remove("burger--active");
      burger.setAttribute("aria-expanded", "false");
      mobileMenu.setAttribute("aria-hidden", "true");
    }
  });
}

/**
 * 2. Projects Filter Tabs Handler
 */
function setupProjectsFilter() {
  const filterBtns = document.querySelectorAll(".filter-btn");
  const projectCards = document.querySelectorAll(".project-card");

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Toggle active tab class
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const filterVal = btn.getAttribute("data-filter");

      projectCards.forEach((card) => {
        const categories = card.getAttribute("data-category").split(" ");
        if (filterVal === "all" || categories.includes(filterVal)) {
          card.style.display = "flex";
          // Quick entry animation
          card.style.opacity = "0";
          card.style.transform = "translateY(10px)";
          setTimeout(() => {
            card.style.opacity = "1";
            card.style.transform = "translateY(0)";
            card.style.transition = "opacity 0.3s ease, transform 0.3s ease";
          }, 50);
        } else {
          card.style.display = "none";
        }
      });
    });
  });
}

/**
 * 3. Modal details populating logic
 */
function setupModalSystem() {
  const modal = document.getElementById("projectModal");
  const modalImg = document.getElementById("modalImg");
  const modalTitle = document.getElementById("modalTitle");
  const modalTags = document.getElementById("modalTags");
  const modalDesc = document.getElementById("modalDesc");
  const modalFeatures = document.getElementById("modalFeatures");
  const modalArch = document.getElementById("modalArch");
  const modalGithubBtn = document.getElementById("modalGithubBtn");
  const modalDemoBtn = document.getElementById("modalDemoBtn");
  
  const closeBtn = document.getElementById("modalCloseBtn");
  const closeActionBtn = document.getElementById("modalCloseActionBtn");

  // Opens the modal and populates it with matching project config details
  function openModal(projectId) {
    const data = projectData[projectId];
    if (!data) return;

    // Set simple details
    modalImg.src = data.image;
    modalImg.alt = `${data.title} Mockup`;
    modalTitle.textContent = data.title;
    modalDesc.textContent = data.desc;
    modalGithubBtn.href = data.github;

    // Toggle live demo button
    if (data.demo) {
      modalDemoBtn.href = data.demo;
      modalDemoBtn.style.display = "inline-flex";
    } else {
      modalDemoBtn.style.display = "none";
    }

    // Populate tags
    modalTags.innerHTML = "";
    data.tags.forEach((tag) => {
      const li = document.createElement("li");
      li.className = "tag";
      li.textContent = tag;
      modalTags.appendChild(li);
    });

    // Populate features
    modalFeatures.innerHTML = "";
    data.features.forEach((feature) => {
      const li = document.createElement("li");
      li.textContent = feature;
      modalFeatures.appendChild(li);
    });

    // Populate architecture details
    modalArch.innerHTML = "";
    data.arch.forEach((detail) => {
      const li = document.createElement("li");
      li.textContent = detail;
      modalArch.appendChild(li);
    });

    // Toggle overlay visibility
    modal.classList.add("modal-backdrop--open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden"; // Prevent background body scroll
  }

  function closeModal() {
    modal.classList.remove("modal-backdrop--open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = ""; // Restore background scroll
  }

  // Bind clicks on project card overlay / trigger buttons
  document.addEventListener("click", (e) => {
    // 1. Overlay card media click
    const cardOverlay = e.target.closest(".project-card__overlay");
    if (cardOverlay) {
      const card = cardOverlay.closest(".project-card");
      if (card) {
        const projectId = card.getAttribute("data-project-id");
        openModal(projectId);
        return;
      }
    }

    // 2. Trigger button click
    const triggerBtn = e.target.closest(".btn-modal-trigger");
    if (triggerBtn) {
      const projectId = triggerBtn.getAttribute("data-project-id");
      openModal(projectId);
      return;
    }

    // 3. Hero card featured thumbnail click
    const featuredThumb = e.target.closest(".featured-thumb");
    if (featuredThumb) {
      const projectId = featuredThumb.getAttribute("data-target");
      openModal(projectId);
      return;
    }
  });

  // Bind close buttons
  closeBtn.addEventListener("click", closeModal);
  closeActionBtn.addEventListener("click", closeModal);

  // Close on backdrop click
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Close on ESC key press
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("modal-backdrop--open")) {
      closeModal();
    }
  });
}

/**
 * 4. Micro-interactions: Contact Form Submit toast
 */
function setupContactForm() {
  const form = document.getElementById("contactForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    // Perform interactive feedback loop
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending...";
    submitBtn.style.background = "var(--secondary)";
    submitBtn.style.boxShadow = "0 4px 12px var(--secondary-glow)";

    const formData = new FormData(form);

    fetch("https://formsubmit.co/ajax/mohdirfanr0329@gmail.com", {
      method: "POST",
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      submitBtn.textContent = "Message Sent! Thank you.";
      submitBtn.style.background = "var(--success)";
      submitBtn.style.boxShadow = "0 4px 12px rgba(16, 185, 129, 0.3)";
      form.reset();

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        submitBtn.style.background = "";
        submitBtn.style.boxShadow = "";
      }, 3000);
    })
    .catch(error => {
      console.error("Error submitting contact form:", error);
      submitBtn.textContent = "Error! Please try again.";
      submitBtn.style.background = "var(--accent)";
      submitBtn.style.boxShadow = "0 4px 12px rgba(236, 72, 153, 0.3)";
      
      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        submitBtn.style.background = "";
        submitBtn.style.boxShadow = "";
      }, 3000);
    });
  });
}

/**
 * 5. Theme Toggling (Dark & Light Mode) with LocalStorage Persistence
 */
function setupThemeToggle() {
  const toggleBtn = document.getElementById("themeToggle");
  const toggleBtnMobile = document.getElementById("themeToggleMobile");
  
  // Check localStorage or system theme preference
  const savedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  
  // Set default theme to dark if no saved preference, or use saved one
  let activeTheme = savedTheme ? savedTheme : (prefersDark ? "dark" : "light");
  
  // Apply the theme to html element attribute
  document.documentElement.setAttribute("data-theme", activeTheme);
  localStorage.setItem("theme", activeTheme);

  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "light" ? "dark" : "light";
    
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  }

  // Bind clicks
  if (toggleBtn) {
    toggleBtn.addEventListener("click", toggleTheme);
  }
  if (toggleBtnMobile) {
    toggleBtnMobile.addEventListener("click", toggleTheme);
  }
}
