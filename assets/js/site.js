(function () {
  const btn = document.querySelector(".menu-btn");
  const links = document.querySelector(".nav-links");
  function setOpen(open) {
    if (!links || !btn) return;
    links.classList.toggle("open", open);
    btn.setAttribute("aria-expanded", open ? "true" : "false");
  }
  if (btn && links) {
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-controls", "site-nav");
    links.id = "site-nav";
    btn.addEventListener("click", () => setOpen(!links.classList.contains("open")));
    links.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setOpen(false)));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
  }

  const path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach((a) => {
    const href = a.getAttribute("href");
    if (href === path || ((path === "" || path === "/") && href === "index.html")) a.classList.add("active");
  });

  document.querySelectorAll("form[data-demo]").forEach((form) => {
    const note = form.querySelector(".success") || form.parentElement.querySelector(".success");
    if (note) note.setAttribute("role", "status");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      if (note) {
        note.classList.add("show");
        note.focus?.();
      }
      form.reset();
    });
  });

  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });

  const lb = document.createElement("div");
  lb.className = "lightbox";
  lb.innerHTML = '<button type="button" aria-label="Close image">×</button><img alt="">';
  document.body.appendChild(lb);
  const lbImg = lb.querySelector("img");
  const closeLb = () => { lb.classList.remove("open"); lbImg.src = ""; };
  lb.querySelector("button").addEventListener("click", closeLb);
  lb.addEventListener("click", (e) => { if (e.target === lb) closeLb(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeLb(); });
  document.querySelectorAll(".gallery img").forEach((img) => {
    img.style.cursor = "zoom-in";
    img.addEventListener("click", () => {
      lbImg.src = img.currentSrc || img.src;
      lbImg.alt = img.alt || "";
      lb.classList.add("open");
    });
  });

  const config = window.EASTC_CONFIG || {};
  const eastc = window.EASTC;
  if (!eastc) return;

  mountLeadership(config);
  mountDirectory(config);
  mountEft(config);
  mountPay(config, eastc);
  mountContactForms(config, eastc);
  mountFab(config, eastc);
  mountPayReturn();
})();

function show(el, text) {
  if (!el) return;
  el.textContent = text;
  el.classList.add("show");
}

function esc(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;");
}

function hide(el) {
  if (!el) return;
  el.classList.remove("show");
}

function mountLeadership(config) {
  const root = document.querySelector("[data-leadership]");
  if (!root || !config.leadership) return;
  const people = [config.leadership.ceo, config.leadership.managingDirector].filter(Boolean);
  root.innerHTML = people.map((person) => {
    const name = person.name || "Name to be confirmed";
    const title = person.title || "Title to be confirmed";
    const role = person.role || "";
    const photo = person.photo || "";
    const alt = person.photoAlt || "Placeholder portrait";
    return `<article class="card"><img class="leader-photo" src="${esc(photo)}" alt="${esc(alt)}"><div class="card-body"><p class="eyebrow">${esc(role)}</p><h3>${esc(name)}</h3><p><span class="tbc">${esc(title)}</span></p></div></article>`;
  }).join("");
}

function mountDirectory(config) {
  const root = document.querySelector("[data-directory]");
  if (!root || !config.departments) return;
  const phones = ((config.contact && config.contact.phones) || []).map((phone) => {
    return `<a href="tel:${esc(phone.tel)}">${esc(phone.label)}</a>`;
  }).join(" · ");
  root.innerHTML = config.departments.map((dept) => {
    const email = window.EASTC.isPlaceholder(dept.email)
      ? `<span class="tbc">Email to be confirmed</span>`
      : `<a href="mailto:${esc(dept.email)}">${esc(dept.email)}</a>`;
    const extra = dept.id === "management"
      ? `<p>Names and photographs for the Institute CEO and Managing Director are placeholders on the <a href="about.html#leadership">About page</a>.</p>`
      : "";
    return `<article class="card"><div class="card-body"><h3>${esc(dept.name)}</h3><p>${email}</p><p>Campus phones published on this site: ${phones}</p>${extra}</div></article>`;
  }).join("");
}

function mountEft(config) {
  const body = document.querySelector("[data-eft-rows]");
  if (!body || !window.EASTC) return;
  body.innerHTML = window.EASTC.eftRows(config.eft).map((row) => {
    const value = row.placeholder ? `<span class="tbc">${row.text}</span>` : row.text;
    return `<tr><th scope="row">${row.label}</th><td>${value}</td></tr>`;
  }).join("");
}

function mountPay(config, eastc) {
  const form = document.querySelector("[data-pay-fees]");
  if (!form) return;
  const banner = document.querySelector("[data-test-banner]");
  const testMode = !config.yoco || config.yoco.testMode !== false;
  if (banner) {
    banner.textContent = testMode
      ? "Yoco test mode is on. No live payment is taken. A payment starts only after YOCO_PAYMENT_LINK_URL or YOCO_CHECKOUT_ENDPOINT replaces the placeholder. This page never sends a Yoco secret key."
      : "Yoco test mode is off in config. This page still starts a payment only through a Yoco link or your server, and it never sends a secret key.";
  }
  if (eastc.secretInPublicConfig(config)) {
    const warn = form.querySelector("[data-secret-warning]");
    show(warn, "A Yoco secret key is in the public config file. Remove it. Secret keys belong on a server. No payment was altered, and the key is not sent.");
  }
  const status = form.querySelector("[data-pay-status]");
  const error = form.querySelector("[data-pay-error]");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    hide(status);
    hide(error);
    const decision = eastc.decidePayment(config, {
      amount: form.amount.value,
      reference: form.reference.value
    });
    if (!decision.ok) {
      show(error, decision.message);
      return;
    }
    const button = form.querySelector("button[type=submit]");
    button.disabled = true;
    try {
      if (decision.action === "unconfigured") {
        show(status, decision.message + " Amount entered: R" + (decision.cents / 100).toFixed(2) + ". Reference: " + decision.reference + ".");
        return;
      }
      if (decision.action === "link") {
        show(status, "Opening the Yoco payment link. The amount charged is the amount saved on that link. Your reference is " + decision.reference + ".");
        window.location.assign(decision.url);
        return;
      }
      const here = new URL("pay.html", window.location.href);
      const payload = eastc.buildCheckoutPayload(decision, {
        success: new URL("?result=success", here).toString(),
        cancel: new URL("?result=cancel", here).toString(),
        failure: new URL("?result=failure", here).toString()
      });
      if (JSON.stringify(payload).includes(config.yoco.YOCO_SECRET_KEY)) {
        show(error, "The payment was stopped because the secret key would have been included. No payment was started.");
        return;
      }
      const response = await fetch(decision.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error("checkout");
      window.location.assign(eastc.assertYocoRedirect(eastc.redirectTarget(data)));
    } catch (err) {
      show(error, "Yoco did not return a payment link. No payment was started.");
    } finally {
      button.disabled = false;
    }
  });
}

function mailboxFor(config, department) {
  const name = String(department || "");
  if (/registry/i.test(name) && config.registryEmail) return config.registryEmail;
  const match = (config.departments || []).find((item) => item.name === name);
  if (match && !window.EASTC.isPlaceholder(match.email)) return match.email;
  return config.contact.mailtoFallback;
}

function mountContactForms(config, eastc) {
  document.querySelectorAll("form[data-contact-form]").forEach((form) => {
    const status = form.querySelector(".notice");
    const error = form.querySelector(".form-error");
    if (status) status.setAttribute("role", "status");
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      hide(error);
      const payload = {
        name: form.name.value.trim(),
        email: form.email.value.trim(),
        department: form.department.value,
        message: form.message.value.trim()
      };
      const endpoint = config.contact && config.contact.CONTACT_FORM_ENDPOINT;
      if (!eastc.isPlaceholder(endpoint)) {
        try {
          const response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify(payload)
          });
          if (!response.ok) throw new Error("endpoint");
          show(status, "Message sent. The office will reply to the email you entered.");
          form.reset();
          return;
        } catch (err) {
          show(status, "The form endpoint did not accept the message. Your email app will open instead.");
        }
      } else {
        show(status, "The contact form endpoint is still a placeholder. Your email app will open a message.");
      }
      const to = mailboxFor(config, payload.department);
      const subject = "EASTECH Institute — " + payload.department;
      const body = "Name: " + payload.name + "\nEmail: " + payload.email + "\nDepartment: " + payload.department + "\n\n" + payload.message;
      window.location.href = "mailto:" + to + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
    });
  });
}

function mountFab(config, eastc) {
  const phones = (config.contact && config.contact.phones) || [];
  const whatsapp = eastc.whatsappHref(config.contact && config.contact.WHATSAPP_NUMBER);
  const panel = document.createElement("div");
  panel.className = "contact-fab";
  const links = phones.map((phone) => `<a href="tel:${phone.tel}">Call ${phone.label}</a>`).join("");
  const wa = whatsapp
    ? `<a href="${whatsapp}" rel="noopener noreferrer">WhatsApp</a>`
    : `<p><span class="tbc">WhatsApp number to be confirmed</span></p>`;
  panel.innerHTML = `<div class="fab-panel" id="fab-panel" hidden>${links}${wa}</div><button type="button" class="fab-toggle" aria-expanded="false" aria-controls="fab-panel">Call / WhatsApp</button>`;
  document.body.appendChild(panel);
  const button = panel.querySelector("button");
  const sheet = panel.querySelector(".fab-panel");
  function setOpen(open) {
    sheet.hidden = !open;
    button.setAttribute("aria-expanded", open ? "true" : "false");
  }
  button.addEventListener("click", () => setOpen(sheet.hidden));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setOpen(false);
  });
}

function mountPayReturn() {
  const slot = document.querySelector("[data-pay-return]");
  if (!slot) return;
  const result = new URLSearchParams(window.location.search).get("result");
  const copy = {
    success: "You came back from Yoco. This page cannot see whether the payment was completed. Keep your reference and wait for Finance to confirm it.",
    cancel: "The Yoco page was cancelled. No payment was recorded on this site.",
    failure: "Yoco did not complete the payment. No payment was recorded on this site."
  };
  if (copy[result]) show(slot, copy[result]);
}
