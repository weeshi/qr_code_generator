import QRCode from "qrcode";

export interface QRGeneratorOptions {
  errorCorrectionLevel?: "L" | "M" | "Q" | "H";
  type?: "image/png" | "image/jpeg" | "image/webp";
  margin?: number;
  width?: number;
  color?: {
    dark?: string;
    light?: string;
  };
}

export interface VCardData {
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  organization?: string;
  url?: string;
  address?: string;
}

export interface WiFiData {
  ssid: string;
  password: string;
  security: "WPA" | "WEP" | "nopass";
  hidden?: boolean;
}

export interface SMSData {
  phone: string;
  message?: string;
}

export interface EmailData {
  email: string;
  subject?: string;
  body?: string;
}

export interface ContactData {
  name: string;
  phone: string;
}

export interface EventData {
  title: string;
  description?: string;
  location?: string;
  startDate: string;
  endDate?: string;
}

// Generate vCard format string
function generateVCard(data: VCardData): string {
  let vcard = "BEGIN:VCARD\nVERSION:3.0\n";
  vcard += `FN:${data.firstName} ${data.lastName}\n`;
  vcard += `N:${data.lastName};${data.firstName};;;\n`;
  
  if (data.phone) vcard += `TEL:${data.phone}\n`;
  if (data.email) vcard += `EMAIL:${data.email}\n`;
  if (data.organization) vcard += `ORG:${data.organization}\n`;
  if (data.url) vcard += `URL:${data.url}\n`;
  if (data.address) vcard += `ADR:;;${data.address};;;;\n`;
  
  vcard += "END:VCARD";
  return vcard;
}

// Generate WiFi format string (WIFI:T:WPA;S:SSID;P:PASSWORD;;)
function generateWiFi(data: WiFiData): string {
  const security = data.security === "nopass" ? "nopass" : data.security;
  const hidden = data.hidden ? "true" : "false";
  return `WIFI:T:${security};S:${data.ssid};P:${data.password};H:${hidden};;`;
}

// Generate SMS format string (smsto:PHONE:MESSAGE)
function generateSMS(data: SMSData): string {
  const message = data.message ? encodeURIComponent(data.message) : "";
  return `smsto:${data.phone}${message ? `:${message}` : ""}`;
}

// Generate email format string (mailto:EMAIL?subject=SUBJECT&body=BODY)
function generateEmail(data: EmailData): string {
  let email = `mailto:${data.email}`;
  const params = [];
  if (data.subject) params.push(`subject=${encodeURIComponent(data.subject)}`);
  if (data.body) params.push(`body=${encodeURIComponent(data.body)}`);
  if (params.length > 0) email += `?${params.join("&")}`;
  return email;
}

// Generate phone format string (tel:PHONE)
function generatePhone(phone: string): string {
  return `tel:${phone}`;
}

// Generate event format string (VEVENT)
function generateEvent(data: EventData): string {
  let event = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//QR Code Generator//EN\nBEGIN:VEVENT\n";
  event += `SUMMARY:${data.title}\n`;
  event += `DTSTART:${data.startDate}\n`;
  if (data.endDate) event += `DTEND:${data.endDate}\n`;
  if (data.description) event += `DESCRIPTION:${data.description}\n`;
  if (data.location) event += `LOCATION:${data.location}\n`;
  event += "END:VEVENT\nEND:VCALENDAR";
  return event;
}

export async function generateQRCode(
  content: string,
  options: QRGeneratorOptions = {}
): Promise<{ dataUrl: string; svg: string }> {
  const {
    errorCorrectionLevel = "M",
    type = "image/png",
    margin = 1,
    width = 300,
    color = { dark: "#000000", light: "#FFFFFF" },
  } = options;

  try {
    // Generate PNG/JPEG data URL
    const dataUrl = await QRCode.toDataURL(content, {
      errorCorrectionLevel: errorCorrectionLevel as any,
      type,
      margin,
      width,
      color,
    });

    // Generate SVG
    const svg = await QRCode.toString(content, {
      errorCorrectionLevel: errorCorrectionLevel as any,
      type: "svg",
      margin,
      width,
      color,
    });

    return { dataUrl, svg };
  } catch (error) {
    throw new Error(`Failed to generate QR code: ${error}`);
  }
}

export async function generateQRCodeByType(
  type: string,
  data: Record<string, any>,
  options?: QRGeneratorOptions
): Promise<{ dataUrl: string; svg: string }> {
  let content = "";

  switch (type) {
    case "vcard":
      content = generateVCard(data as VCardData);
      break;
    case "url":
      content = data.url || "";
      break;
    case "wifi":
      content = generateWiFi(data as WiFiData);
      break;
    case "sms":
      content = generateSMS(data as SMSData);
      break;
    case "email":
      content = generateEmail(data as EmailData);
      break;
    case "phone":
      content = generatePhone(data.phone);
      break;
    case "event":
      content = generateEvent(data as EventData);
      break;
    case "facebook":
      content = data.url || "https://facebook.com";
      break;
    case "instagram":
      content = data.url || "https://instagram.com";
      break;
    case "whatsapp":
      content = `https://wa.me/${data.phone}${data.message ? `?text=${encodeURIComponent(data.message)}` : ""}`;
      break;
    case "text":
      content = data.text || "";
      break;
    case "pdf":
    case "image":
    case "video":
    case "mp3":
    case "business":
    case "coupon":
    case "app":
    case "menu":
      // For file-based types, use the provided URL
      content = data.url || "";
      break;
    default:
      throw new Error(`Unsupported QR code type: ${type}`);
  }

  if (!content) {
    throw new Error("Content is required to generate QR code");
  }

  return generateQRCode(content, options);
}
