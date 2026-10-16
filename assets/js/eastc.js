(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.EASTC = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  var PLACEHOLDERS = {
    YOCO_PUBLIC_KEY: true,
    YOCO_SECRET_KEY: true,
    YOCO_PAYMENT_LINK_URL: true,
    YOCO_CHECKOUT_ENDPOINT: true,
    CONTACT_FORM_ENDPOINT: true,
    WHATSAPP_NUMBER: true,
    FINANCE_EMAIL: true,
    STUDENT_SUPPORT_EMAIL: true,
    MANAGEMENT_EMAIL: true,
    TO_BE_CONFIRMED: true
  };

  function isPlaceholder(value) {
    if (value == null) return true;
    var text = String(value).trim();
    if (!text) return true;
    if (PLACEHOLDERS[text]) return true;
    return false;
  }

  function yocoHostOk(url) {
    var host = String(url.hostname || "").toLowerCase();
    return host === "pay.yoco.com" || host === "c.yoco.com" || host === "payments.yoco.com";
  }

  function secretInPublicConfig(config) {
    var secret = config && config.yoco && config.yoco.YOCO_SECRET_KEY;
    if (isPlaceholder(secret)) return false;
    return true;
  }

  function decidePayment(config, input) {
    var yoco = (config && config.yoco) || {};
    var rawAmount = String(input.amount == null ? "" : input.amount).trim().replace(",", ".");
    var reference = String(input.reference == null ? "" : input.reference).trim();
    if (!/^[A-Za-z0-9][A-Za-z0-9 .\/#-]{1,39}$/.test(reference)) {
      return { ok: false, message: "Enter a student number or invoice reference (letters, numbers, and simple punctuation)." };
    }
    if (!/^\d+(\.\d{1,2})?$/.test(rawAmount)) {
      return { ok: false, message: "Enter the amount in rands, for example 2500 or 2500.50." };
    }
    var amountParts = rawAmount.split(".");
    var cents = Number(amountParts[0]) * 100 + Number((amountParts[1] || "").padEnd(2, "0").slice(0, 2));
    if (!Number.isFinite(cents) || cents < 200) {
      return { ok: false, message: "Enter at least R2.00. Yoco does not take a payment smaller than that." };
    }
    var testMode = yoco.testMode !== false;
    var base = {
      ok: true,
      cents: cents,
      reference: reference,
      testMode: testMode,
      secretInPublicConfig: secretInPublicConfig(config)
    };
    if (!isPlaceholder(yoco.YOCO_CHECKOUT_ENDPOINT)) {
      var endpoint;
      try {
        endpoint = new URL(yoco.YOCO_CHECKOUT_ENDPOINT);
      } catch (error) {
        return { ok: false, message: "YOCO_CHECKOUT_ENDPOINT is not a valid URL. No payment was started." };
      }
      if (endpoint.protocol !== "https:") {
        return { ok: false, message: "The Yoco checkout endpoint must use HTTPS. No payment was started." };
      }
      base.action = "checkout";
      base.endpoint = endpoint.toString();
      return base;
    }
    if (!isPlaceholder(yoco.YOCO_PAYMENT_LINK_URL)) {
      var link;
      try {
        link = new URL(yoco.YOCO_PAYMENT_LINK_URL);
      } catch (error) {
        return { ok: false, message: "YOCO_PAYMENT_LINK_URL is not a valid URL. No payment was started." };
      }
      if (link.protocol !== "https:" || !yocoHostOk(link)) {
        return { ok: false, message: "The payment link must be an https link on pay.yoco.com or c.yoco.com. No payment was started." };
      }
      base.action = "link";
      base.url = link.toString();
      return base;
    }
    base.action = "unconfigured";
    base.message = "Yoco test mode: no payment was started. YOCO_PAYMENT_LINK_URL and YOCO_CHECKOUT_ENDPOINT are still placeholders.";
    return base;
  }

  function buildCheckoutPayload(decision, urls) {
    return {
      amount: decision.cents,
      currency: "ZAR",
      clientReferenceId: decision.reference,
      externalId: decision.reference,
      metadata: { studentReference: decision.reference, purpose: "student-fees" },
      lineItems: [
        {
          displayName: "Student fees",
          quantity: 1,
          pricingDetails: { price: decision.cents }
        }
      ],
      successUrl: urls.success,
      cancelUrl: urls.cancel,
      failureUrl: urls.failure,
      testMode: decision.testMode
    };
  }

  function redirectTarget(data) {
    if (!data || typeof data !== "object") return "";
    return data.redirectUrl || data.url || "";
  }

  function assertYocoRedirect(value) {
    var url = new URL(value);
    if (url.protocol !== "https:" || !yocoHostOk(url)) {
      throw new Error("Checkout did not return a Yoco link.");
    }
    return url.toString();
  }

  function eftRows(eft) {
    var fields = [
      ["Bank", eft && eft.bankName],
      ["Account name", eft && eft.accountName],
      ["Account number", eft && eft.accountNumber],
      ["Branch code", eft && eft.branchCode],
      ["Account type", eft && eft.accountType]
    ];
    return fields.map(function (pair) {
      var value = pair[1];
      return {
        label: pair[0],
        placeholder: isPlaceholder(value),
        text: isPlaceholder(value) ? "Placeholder — to be confirmed" : String(value)
      };
    });
  }

  function whatsappHref(value) {
    if (isPlaceholder(value)) return "";
    var digits = String(value).replace(/[^\d]/g, "");
    if (digits.length < 10 || digits.length > 15) return "";
    if (digits.charAt(0) === "0") digits = "27" + digits.slice(1);
    return "https://wa.me/" + digits;
  }

  return {
    isPlaceholder: isPlaceholder,
    decidePayment: decidePayment,
    buildCheckoutPayload: buildCheckoutPayload,
    redirectTarget: redirectTarget,
    assertYocoRedirect: assertYocoRedirect,
    eftRows: eftRows,
    whatsappHref: whatsappHref,
    secretInPublicConfig: secretInPublicConfig
  };
});
