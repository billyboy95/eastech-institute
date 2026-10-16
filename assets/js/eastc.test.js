const test = require("node:test");
const assert = require("node:assert/strict");
const eastc = require("./eastc.js");

const config = {
  yoco: {
    testMode: true,
    YOCO_PUBLIC_KEY: "YOCO_PUBLIC_KEY",
    YOCO_SECRET_KEY: "YOCO_SECRET_KEY",
    YOCO_PAYMENT_LINK_URL: "YOCO_PAYMENT_LINK_URL",
    YOCO_CHECKOUT_ENDPOINT: "YOCO_CHECKOUT_ENDPOINT"
  },
  eft: {
    bankName: "TO_BE_CONFIRMED",
    accountName: "TO_BE_CONFIRMED",
    accountNumber: "TO_BE_CONFIRMED",
    branchCode: "TO_BE_CONFIRMED",
    accountType: "TO_BE_CONFIRMED"
  }
};

test("placeholders do not start a Yoco payment", function () {
  const result = eastc.decidePayment(config, { amount: "500", reference: "STU1001" });
  assert.equal(result.ok, true);
  assert.equal(result.action, "unconfigured");
  assert.equal(result.testMode, true);
  assert.equal(result.cents, 50000);
  assert.equal(JSON.stringify(result).includes("sk_"), false);
});

test("amount and reference are required", function () {
  assert.equal(eastc.decidePayment(config, { amount: "1", reference: "STU1" }).ok, false);
  assert.equal(eastc.decidePayment(config, { amount: "10", reference: "x" }).ok, false);
  assert.equal(eastc.decidePayment(config, { amount: "10.999", reference: "STU1" }).ok, false);
  assert.equal(eastc.decidePayment(config, { amount: "2,50", reference: "STU1" }).cents, 250);
});

test("a Yoco payment link is accepted and a foreign link is not", function () {
  const linked = Object.assign({}, config, {
    yoco: Object.assign({}, config.yoco, {
      YOCO_PAYMENT_LINK_URL: "https://pay.yoco.com/r/example"
    })
  });
  const ok = eastc.decidePayment(linked, { amount: "20.50", reference: "INV-22" });
  assert.equal(ok.action, "link");
  assert.equal(ok.url, "https://pay.yoco.com/r/example");
  assert.equal(ok.cents, 2050);

  const foreign = Object.assign({}, config, {
    yoco: Object.assign({}, config.yoco, {
      YOCO_PAYMENT_LINK_URL: "https://example.com/pay"
    })
  });
  assert.equal(eastc.decidePayment(foreign, { amount: "20", reference: "INV-22" }).ok, false);
});

test("checkout payload never includes the secret key", function () {
  const withSecret = Object.assign({}, config, {
    yoco: Object.assign({}, config.yoco, {
      YOCO_SECRET_KEY: "sk_test_not_a_real_key",
      YOCO_CHECKOUT_ENDPOINT: "https://payments.example.edu/yoco/checkout"
    })
  });
  const decision = eastc.decidePayment(withSecret, { amount: "100", reference: "STU9" });
  assert.equal(decision.action, "checkout");
  assert.equal(decision.secretInPublicConfig, true);
  const payload = eastc.buildCheckoutPayload(decision, {
    success: "https://eastech-institute.co.za/pay.html?result=success",
    cancel: "https://eastech-institute.co.za/pay.html?result=cancel",
    failure: "https://eastech-institute.co.za/pay.html?result=failure"
  });
  const encoded = JSON.stringify(payload);
  assert.equal(encoded.includes("sk_test"), false);
  assert.equal(encoded.includes("YOCO_SECRET_KEY"), false);
  assert.equal(payload.amount, 10000);
  assert.equal(payload.currency, "ZAR");
  assert.equal(payload.clientReferenceId, "STU9");
  assert.equal(payload.testMode, true);
});

test("only Yoco redirect hosts are accepted", function () {
  assert.equal(
    eastc.assertYocoRedirect("https://c.yoco.com/checkout/abc123"),
    "https://c.yoco.com/checkout/abc123"
  );
  assert.throws(function () {
    eastc.assertYocoRedirect("https://example.com/checkout/abc123");
  });
});

test("EFT rows stay placeholders and WhatsApp is unset", function () {
  const rows = eastc.eftRows(config.eft);
  assert.equal(rows.length, 5);
  rows.forEach(function (row) {
    assert.equal(row.placeholder, true);
    assert.equal(row.text, "Placeholder — to be confirmed");
  });
  assert.equal(eastc.whatsappHref("WHATSAPP_NUMBER"), "");
  assert.equal(eastc.whatsappHref("0826051134"), "https://wa.me/27826051134");
});
