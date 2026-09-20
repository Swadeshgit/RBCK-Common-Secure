/* =====================================================
   SANITIZE MIDDLEWARE
   express-mongo-sanitize, Express v5 ke read-only req.query
   ke saath compatible nahi hai (crash deta hai). Isliye
   khud ka lightweight sanitizer likha hai — same kaam:
   NoSQL injection wale operators ($gt, $ne, etc.) aur "."
   wale malicious keys ko object se hata deta hai.
===================================================== */
const sanitizeObject = (obj) => {
  if (obj === null || typeof obj !== "object") return obj;

  for (const key in obj) {
    if (key.startsWith("$") || key.includes(".")) {
      delete obj[key];
    } else if (typeof obj[key] === "object") {
      sanitizeObject(obj[key]);
    }
  }
  return obj;
};

export const sanitizeMiddleware = (req, res, next) => {
  if (req.body) sanitizeObject(req.body);
  if (req.params) sanitizeObject(req.params);
  /* req.query ko Express v5 me overwrite nahi kar sakte,
     isliye sirf uske andar ke keys mutate karte hain (in-place) —
     ye allowed hai, sirf poora req.query replace karna allowed nahi */
  if (req.query) sanitizeObject(req.query);
  next();
};