/* EASTECH Institute public config.
   Replace placeholder tokens in this file. Do not put a live Yoco secret here:
   Yoco secret keys belong on a server. This site never sends YOCO_SECRET_KEY. */
window.EASTC_CONFIG = {
  yoco: {
    /* Test mode is on until you set this to false and replace the placeholders. */
    testMode: true,
    YOCO_PUBLIC_KEY: "YOCO_PUBLIC_KEY",
    YOCO_SECRET_KEY: "YOCO_SECRET_KEY",
    YOCO_PAYMENT_LINK_URL: "YOCO_PAYMENT_LINK_URL",
    /* Your server creates a Yoco Checkout (or payment link) and returns { redirectUrl } or { url }. */
    YOCO_CHECKOUT_ENDPOINT: "YOCO_CHECKOUT_ENDPOINT"
  },
  contact: {
    CONTACT_FORM_ENDPOINT: "CONTACT_FORM_ENDPOINT",
    /* Published on this site. Used when a department address is still a placeholder. */
    mailtoFallback: "admissions@eastechinstitute.ac.za",
    WHATSAPP_NUMBER: "WHATSAPP_NUMBER",
    phones: [
      { label: "011 394 1488", tel: "+27113941488" },
      { label: "082 605 1134", tel: "+27826051134" }
    ]
  },
  departments: [
    {
      id: "admissions",
      name: "Admissions",
      email: "admissions@eastechinstitute.ac.za",
      published: true
    },
    {
      id: "finance",
      name: "Finance",
      email: "FINANCE_EMAIL",
      published: false
    },
    {
      id: "student-support",
      name: "Student support",
      email: "STUDENT_SUPPORT_EMAIL",
      published: false
    },
    {
      id: "management",
      name: "Management",
      email: "MANAGEMENT_EMAIL",
      published: false
    }
  ],
  /* Also published on this site, outside the four departments above. */
  registryEmail: "registrar@eastechinstitute.ac.za",
  address: "43 Maxwell Street, Kempton Park",
  eft: {
    bankName: "TO_BE_CONFIRMED",
    accountName: "TO_BE_CONFIRMED",
    accountNumber: "TO_BE_CONFIRMED",
    branchCode: "TO_BE_CONFIRMED",
    accountType: "TO_BE_CONFIRMED"
  },
  leadership: {
    ceo: {
      name: "Name to be confirmed",
      title: "Title to be confirmed",
      role: "Chief Executive Officer",
      photo: "assets/img/leadership/ceo-placeholder.svg",
      photoAlt: "Placeholder monogram for the EASTECH Institute Chief Executive Officer. Not a photograph of a person."
    },
    managingDirector: {
      name: "Name to be confirmed",
      title: "Title to be confirmed",
      role: "Managing Director",
      photo: "assets/img/leadership/md-placeholder.svg",
      photoAlt: "Placeholder monogram for the EASTECH Institute Managing Director. Not a photograph of a person."
    }
  }
};
