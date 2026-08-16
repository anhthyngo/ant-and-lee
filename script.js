(function () {
  "use strict";

  const ACCESS_KEY = "anthy-lee-wedding-access";
  const PASSWORD_HASH = "51077b4a24909a41eb53f002ed5c6914687c7c3c4733ec35d6c3f134d8939427";
  const gate = document.querySelector("#password-gate");
  const form = document.querySelector("#password-form");
  const passwordInput = document.querySelector("#guest-password");
  const passwordError = document.querySelector("#password-error");
  const main = document.querySelector("#main-content");

  function hasAccess() {
    try {
      return window.sessionStorage.getItem(ACCESS_KEY) === "granted";
    } catch (_error) {
      return false;
    }
  }

  function rememberAccess() {
    try {
      window.sessionStorage.setItem(ACCESS_KEY, "granted");
    } catch (_error) {
      // Access still works when session storage is unavailable.
    }
  }

  function unlockSite(shouldFocus) {
    document.documentElement.classList.remove("is-locked");

    if (gate) {
      gate.hidden = true;
    }

    if (main) {
      main.removeAttribute("inert");
      main.removeAttribute("aria-hidden");

      if (shouldFocus) {
        main.setAttribute("tabindex", "-1");
        main.focus({ preventScroll: true });
      }
    }
  }

  async function hashPassword(value) {
    const bytes = new TextEncoder().encode(value);
    const digest = await window.crypto.subtle.digest("SHA-256", bytes);

    return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
  }

  if (hasAccess()) {
    unlockSite(false);
  } else if (passwordInput) {
    passwordInput.focus();
  }

  if (form && passwordInput && passwordError) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      passwordError.textContent = "";
      passwordInput.removeAttribute("aria-invalid");

      try {
        const submittedHash = await hashPassword(passwordInput.value);

        if (submittedHash === PASSWORD_HASH) {
          rememberAccess();
          passwordInput.value = "";
          unlockSite(true);
          return;
        }
      } catch (_error) {
        passwordError.textContent = "This browser could not check the password. Please try another browser.";
        return;
      }

      passwordInput.setAttribute("aria-invalid", "true");
      passwordError.textContent = "That password isn’t correct. Please try again.";
      passwordInput.select();
    });
  }

  const content = window.WEDDING_CONTENT;

  if (!content) {
    return;
  }

  function getValue(path) {
    return path.split(".").reduce((value, key) => value && value[key], content);
  }

  function makeElement(tagName, className, value) {
    const element = document.createElement(tagName);
    if (className) {
      element.className = className;
    }
    if (value !== undefined) {
      element.textContent = value;
    }
    return element;
  }

  function setTextContent() {
    document.querySelectorAll("[data-copy]").forEach((element) => {
      const value = getValue(element.dataset.copy);
      if (typeof value === "string" || typeof value === "number") {
        element.textContent = value;
      }
    });

    const titleSuffix = document.body.dataset.page === "schedule" ? "Weekend Schedule" : "Save the Date";
    document.title = `${content.names.one} & ${content.names.two} — ${titleSuffix}`;
  }

  function renderSchedule() {
    const list = document.querySelector("#schedule-list");
    const items = content.schedule && content.schedule.items;

    if (!list || !Array.isArray(items)) {
      return;
    }

    list.replaceChildren();

    items.forEach((item) => {
      const scheduleItem = makeElement("li", "schedule-item");
      const date = makeElement("p", "schedule-date-label", item.dateLabel || `${item.day} ${item.date}`);
      const scheduleCopy = makeElement("div", "schedule-copy");
      const events = Array.isArray(item.events)
        ? item.events
        : [{ time: item.time, title: item.title, translation: item.translation, detail: item.detail }];

      events.forEach((eventItem) => {
        const slot = makeElement("div", "schedule-slot");
        const time = makeElement("p", "schedule-time", eventItem.time);
        const title = makeElement("h3", "schedule-event-title", eventItem.title);
        const translation = makeElement("p", "schedule-translation", eventItem.translation);
        const detail = makeElement("p", "schedule-detail", eventItem.detail);
        slot.append(time, title, translation, detail);
        scheduleCopy.append(slot);
      });

      scheduleItem.append(date, scheduleCopy);
      list.appendChild(scheduleItem);
    });
  }

  setTextContent();
  renderSchedule();

  const menuToggle = document.querySelector(".site-menu__toggle");
  const menuPanel = document.querySelector("#site-menu-panel");

  if (menuToggle && menuPanel) {
    menuToggle.addEventListener("click", () => {
      const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
      menuToggle.setAttribute("aria-expanded", String(!isOpen));
      menuPanel.hidden = isOpen;
    });

    document.addEventListener("click", (event) => {
      const clickedInsideMenu = event.target instanceof Element && event.target.closest(".site-menu");

      if (!clickedInsideMenu) {
        menuToggle.setAttribute("aria-expanded", "false");
        menuPanel.hidden = true;
      }
    });
  }
})();
