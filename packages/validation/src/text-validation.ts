import { z } from "zod";

/**
 * List of dangerous HTML tags that could be used for XSS attacks
 */
const DANGEROUS_HTML_TAGS = [
  "script",
  "iframe",
  "object",
  "embed",
  "form",
  "input",
  "button",
  "select",
  "textarea",
  "link",
  "style",
  "meta",
  "base",
  "applet",
  "body",
  "html",
  "frame",
  "frameset",
];

/**
 * List of dangerous HTML event handlers that could execute JavaScript
 */
const DANGEROUS_EVENT_HANDLERS = [
  "onload",
  "onerror",
  "onclick",
  "onmouseover",
  "onmouseout",
  "onmousemove",
  "onmousedown",
  "onmouseup",
  "onfocus",
  "onblur",
  "onchange",
  "onsubmit",
  "onkeydown",
  "onkeyup",
  "onkeypress",
  "ondblclick",
  "oncontextmenu",
  "oninput",
  "onscroll",
  "ondrag",
  "ondrop",
];

/**
 * Checks if text contains dangerous HTML tags or event handlers
 * This helps prevent stored XSS attacks
 */
export function containsDangerousHTML(text: string): boolean {
  if (!text) return false;

  const lowerText = text.toLowerCase();

  // Check for dangerous HTML tags
  for (const tag of DANGEROUS_HTML_TAGS) {
    // Check for opening tags: <script>, <script >, <script/>
    if (
      lowerText.includes(`<${tag}>`) ||
      lowerText.includes(`<${tag} `) ||
      lowerText.includes(`<${tag}/`)
    ) {
      return true;
    }
  }

  // Check for dangerous event handlers
  for (const handler of DANGEROUS_EVENT_HANDLERS) {
    // Check for event handlers: onclick=, onclick =, onclick  =
    if (lowerText.includes(`${handler}=`)) {
      return true;
    }
  }

  // Check for javascript: protocol (defense in depth, should be caught by URL validation)
  if (lowerText.includes("javascript:")) {
    return true;
  }

  // Check for data: URIs with script content
  if (lowerText.includes("data:") && lowerText.includes("script")) {
    return true;
  }

  return false;
}

/**
 * Custom error message for dangerous HTML detection
 */
const DANGEROUS_HTML_ERROR =
  "Text contains potentially dangerous HTML tags or scripts";

/**
 * Zod refinement function for safe text validation
 * Use with .refine() on existing string schemas
 */
export const safeTextRefinement = (val: string | undefined | null) => {
  if (!val) return true;
  return !containsDangerousHTML(val);
};

/**
 * Zod schema for safe text that blocks dangerous HTML/script tags
 * Use this for user-generated text fields like descriptions, bios, comments, etc.
 */
export const safeText = (fieldName: string = "Text") =>
  z.string().refine((val) => !containsDangerousHTML(val), {
    message: `${fieldName} contains potentially dangerous HTML tags or scripts`,
  });

/**
 * Optional safe text field
 */
export const optionalSafeText = (fieldName: string = "Text") =>
  z
    .string()
    .optional()
    .refine((val) => !val || !containsDangerousHTML(val), {
      message: `${fieldName} contains potentially dangerous HTML tags or scripts`,
    });

/**
 * Safe text that can be empty string
 */
export const safeTextOrEmpty = (fieldName: string = "Text") =>
  z.string().refine((val) => !val || !containsDangerousHTML(val), {
    message: `${fieldName} contains potentially dangerous HTML tags or scripts`,
  });
