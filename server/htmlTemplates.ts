/**
 * Professional HTML Templates for QR Code Content
 */

export interface VCardTemplateData {
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  organization?: string;
  url?: string;
  address?: string;
  photo?: string;
  qrCodeUrl?: string;
}

export interface SocialMediaTemplateData {
  name: string;
  bio?: string;
  instagram?: string;
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  tiktok?: string;
  youtube?: string;
  qrCodeUrl?: string;
}

export interface BusinessTemplateData {
  companyName: string;
  description?: string;
  industry?: string;
  website?: string;
  phone?: string;
  email?: string;
  address?: string;
  logo?: string;
  qrCodeUrl?: string;
}

export interface MenuTemplateData {
  restaurantName: string;
  description?: string;
  categories: Array<{
    name: string;
    items: Array<{
      name: string;
      description?: string;
      price: string;
    }>;
  }>;
  phone?: string;
  address?: string;
  qrCodeUrl?: string;
}

export interface CouponTemplateData {
  title: string;
  description?: string;
  discount: string;
  code: string;
  validUntil?: string;
  terms?: string;
  companyName?: string;
  qrCodeUrl?: string;
}

/**
 * Generate professional vCard HTML template
 */
export function generateVCardTemplate(data: VCardTemplateData): string {
  return `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.firstName} ${data.lastName}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .card {
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            max-width: 500px;
            width: 100%;
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        .name {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .title {
            font-size: 14px;
            opacity: 0.9;
        }
        .content {
            padding: 30px;
        }
        .info-group {
            margin-bottom: 20px;
        }
        .info-label {
            color: #667eea;
            font-weight: 600;
            font-size: 12px;
            text-transform: uppercase;
            margin-bottom: 5px;
        }
        .info-value {
            color: #333;
            font-size: 14px;
            word-break: break-all;
        }
        .qr-section {
            text-align: center;
            border-top: 1px solid #eee;
            padding-top: 20px;
            margin-top: 20px;
        }
        .qr-image {
            max-width: 150px;
            height: auto;
        }
    </style>
</head>
<body>
    <div class="card">
        <div class="header">
            <div class="name">${data.firstName} ${data.lastName}</div>
            ${data.organization ? `<div class="title">${data.organization}</div>` : ''}
        </div>
        <div class="content">
            ${data.email ? `
            <div class="info-group">
                <div class="info-label">البريد الإلكتروني</div>
                <div class="info-value"><a href="mailto:${data.email}">${data.email}</a></div>
            </div>
            ` : ''}
            ${data.phone ? `
            <div class="info-group">
                <div class="info-label">الهاتف</div>
                <div class="info-value"><a href="tel:${data.phone}">${data.phone}</a></div>
            </div>
            ` : ''}
            ${data.url ? `
            <div class="info-group">
                <div class="info-label">الموقع الإلكتروني</div>
                <div class="info-value"><a href="${data.url}" target="_blank">${data.url}</a></div>
            </div>
            ` : ''}
            ${data.address ? `
            <div class="info-group">
                <div class="info-label">العنوان</div>
                <div class="info-value">${data.address}</div>
            </div>
            ` : ''}
            ${data.qrCodeUrl ? `
            <div class="qr-section">
                <img src="${data.qrCodeUrl}" alt="QR Code" class="qr-image">
            </div>
            ` : ''}
        </div>
    </div>
</body>
</html>
  `;
}

/**
 * Generate professional social media template
 */
export function generateSocialMediaTemplate(data: SocialMediaTemplateData): string {
  return `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.name} - وسائل التواصل</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container {
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            max-width: 500px;
            width: 100%;
            padding: 40px 30px;
            text-align: center;
        }
        .name {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 10px;
            color: #333;
        }
        .bio {
            color: #666;
            font-size: 14px;
            margin-bottom: 30px;
        }
        .social-links {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        .social-link {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 12px 20px;
            border-radius: 8px;
            text-decoration: none;
            color: white;
            font-weight: 600;
            transition: transform 0.2s;
        }
        .social-link:hover {
            transform: translateY(-2px);
        }
        .instagram {
            background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
        }
        .facebook {
            background: #1877f2;
        }
        .twitter {
            background: #1da1f2;
        }
        .linkedin {
            background: #0a66c2;
        }
        .tiktok {
            background: #000000;
        }
        .youtube {
            background: #ff0000;
        }
        .qr-section {
            margin-top: 30px;
            padding-top: 30px;
            border-top: 1px solid #eee;
        }
        .qr-image {
            max-width: 150px;
            height: auto;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="name">${data.name}</div>
        ${data.bio ? `<div class="bio">${data.bio}</div>` : ''}
        
        <div class="social-links">
            ${data.instagram ? `<a href="https://instagram.com/${data.instagram}" target="_blank" class="social-link instagram">Instagram</a>` : ''}
            ${data.facebook ? `<a href="https://facebook.com/${data.facebook}" target="_blank" class="social-link facebook">Facebook</a>` : ''}
            ${data.twitter ? `<a href="https://twitter.com/${data.twitter}" target="_blank" class="social-link twitter">Twitter</a>` : ''}
            ${data.linkedin ? `<a href="https://linkedin.com/in/${data.linkedin}" target="_blank" class="social-link linkedin">LinkedIn</a>` : ''}
            ${data.tiktok ? `<a href="https://tiktok.com/@${data.tiktok}" target="_blank" class="social-link tiktok">TikTok</a>` : ''}
            ${data.youtube ? `<a href="https://youtube.com/@${data.youtube}" target="_blank" class="social-link youtube">YouTube</a>` : ''}
        </div>
        
        ${data.qrCodeUrl ? `
        <div class="qr-section">
            <img src="${data.qrCodeUrl}" alt="QR Code" class="qr-image">
        </div>
        ` : ''}
    </div>
</body>
</html>
  `;
}

/**
 * Generate professional business information template
 */
export function generateBusinessTemplate(data: BusinessTemplateData): string {
  return `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.companyName}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #f5f5f5;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 10px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        ${data.logo ? `.logo { max-width: 100px; margin-bottom: 20px; }` : ''}
        .company-name {
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .industry {
            font-size: 14px;
            opacity: 0.9;
        }
        .content {
            padding: 40px 30px;
        }
        .description {
            color: #666;
            line-height: 1.6;
            margin-bottom: 30px;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
        }
        .info-item {
            padding: 15px;
            background: #f9f9f9;
            border-radius: 8px;
        }
        .info-label {
            color: #667eea;
            font-weight: 600;
            font-size: 12px;
            text-transform: uppercase;
            margin-bottom: 5px;
        }
        .info-value {
            color: #333;
            font-size: 14px;
            word-break: break-all;
        }
        .qr-section {
            text-align: center;
            padding-top: 30px;
            border-top: 1px solid #eee;
        }
        .qr-image {
            max-width: 150px;
            height: auto;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            ${data.logo ? `<img src="${data.logo}" alt="Logo" class="logo">` : ''}
            <div class="company-name">${data.companyName}</div>
            ${data.industry ? `<div class="industry">${data.industry}</div>` : ''}
        </div>
        <div class="content">
            ${data.description ? `<div class="description">${data.description}</div>` : ''}
            
            <div class="info-grid">
                ${data.website ? `
                <div class="info-item">
                    <div class="info-label">الموقع</div>
                    <div class="info-value"><a href="${data.website}" target="_blank">${data.website}</a></div>
                </div>
                ` : ''}
                ${data.phone ? `
                <div class="info-item">
                    <div class="info-label">الهاتف</div>
                    <div class="info-value"><a href="tel:${data.phone}">${data.phone}</a></div>
                </div>
                ` : ''}
                ${data.email ? `
                <div class="info-item">
                    <div class="info-label">البريد</div>
                    <div class="info-value"><a href="mailto:${data.email}">${data.email}</a></div>
                </div>
                ` : ''}
                ${data.address ? `
                <div class="info-item">
                    <div class="info-label">العنوان</div>
                    <div class="info-value">${data.address}</div>
                </div>
                ` : ''}
            </div>
            
            ${data.qrCodeUrl ? `
            <div class="qr-section">
                <img src="${data.qrCodeUrl}" alt="QR Code" class="qr-image">
            </div>
            ` : ''}
        </div>
    </div>
</body>
</html>
  `;
}

/**
 * Generate professional restaurant menu template
 */
export function generateMenuTemplate(data: MenuTemplateData): string {
  return `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.restaurantName} - القائمة</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #f5f5f5;
            padding: 20px;
        }
        .container {
            max-width: 700px;
            margin: 0 auto;
            background: white;
            border-radius: 10px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #f4a460 0%, #d2691e 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        .restaurant-name {
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .description {
            font-size: 14px;
            opacity: 0.9;
        }
        .content {
            padding: 30px;
        }
        .category {
            margin-bottom: 30px;
        }
        .category-title {
            font-size: 20px;
            font-weight: bold;
            color: #d2691e;
            margin-bottom: 15px;
            border-bottom: 2px solid #f4a460;
            padding-bottom: 10px;
        }
        .menu-item {
            margin-bottom: 15px;
            padding-bottom: 15px;
            border-bottom: 1px solid #eee;
        }
        .menu-item:last-child {
            border-bottom: none;
        }
        .item-name {
            font-weight: 600;
            color: #333;
            margin-bottom: 5px;
        }
        .item-description {
            font-size: 13px;
            color: #666;
            margin-bottom: 5px;
        }
        .item-price {
            font-size: 14px;
            font-weight: bold;
            color: #d2691e;
        }
        .footer {
            background: #f9f9f9;
            padding: 20px 30px;
            text-align: center;
            border-top: 1px solid #eee;
        }
        .contact-info {
            font-size: 13px;
            color: #666;
            margin-bottom: 10px;
        }
        .qr-image {
            max-width: 120px;
            height: auto;
            margin-top: 15px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="restaurant-name">${data.restaurantName}</div>
            ${data.description ? `<div class="description">${data.description}</div>` : ''}
        </div>
        <div class="content">
            ${data.categories.map(category => `
            <div class="category">
                <div class="category-title">${category.name}</div>
                ${category.items.map(item => `
                <div class="menu-item">
                    <div class="item-name">${item.name}</div>
                    ${item.description ? `<div class="item-description">${item.description}</div>` : ''}
                    <div class="item-price">${item.price}</div>
                </div>
                `).join('')}
            </div>
            `).join('')}
        </div>
        <div class="footer">
            ${data.phone ? `<div class="contact-info">الهاتف: <a href="tel:${data.phone}">${data.phone}</a></div>` : ''}
            ${data.address ? `<div class="contact-info">العنوان: ${data.address}</div>` : ''}
            ${data.qrCodeUrl ? `<img src="${data.qrCodeUrl}" alt="QR Code" class="qr-image">` : ''}
        </div>
    </div>
</body>
</html>
  `;
}

/**
 * Generate professional coupon template
 */
export function generateCouponTemplate(data: CouponTemplateData): string {
  return `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.title}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #f5f5f5;
            padding: 20px;
        }
        .container {
            max-width: 500px;
            margin: 0 auto;
        }
        .coupon {
            background: white;
            border-radius: 15px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
            overflow: hidden;
            border: 3px dashed #ff6b6b;
        }
        .header {
            background: linear-gradient(135deg, #ff6b6b 0%, #ff8787 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .company-name {
            font-size: 14px;
            opacity: 0.9;
            margin-bottom: 10px;
        }
        .title {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .discount {
            font-size: 36px;
            font-weight: bold;
        }
        .content {
            padding: 30px;
            text-align: center;
        }
        .description {
            color: #666;
            margin-bottom: 20px;
            line-height: 1.6;
        }
        .code-section {
            background: #f9f9f9;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .code-label {
            color: #999;
            font-size: 12px;
            text-transform: uppercase;
            margin-bottom: 5px;
        }
        .code {
            font-size: 24px;
            font-weight: bold;
            color: #ff6b6b;
            font-family: 'Courier New', monospace;
            letter-spacing: 2px;
        }
        .terms {
            font-size: 12px;
            color: #999;
            line-height: 1.6;
            margin-bottom: 20px;
        }
        .valid-until {
            color: #ff6b6b;
            font-weight: 600;
            margin-bottom: 20px;
        }
        .qr-section {
            text-align: center;
        }
        .qr-image {
            max-width: 150px;
            height: auto;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="coupon">
            <div class="header">
                ${data.companyName ? `<div class="company-name">${data.companyName}</div>` : ''}
                <div class="title">${data.title}</div>
                <div class="discount">${data.discount}</div>
            </div>
            <div class="content">
                ${data.description ? `<div class="description">${data.description}</div>` : ''}
                
                <div class="code-section">
                    <div class="code-label">رمز القسيمة</div>
                    <div class="code">${data.code}</div>
                </div>
                
                ${data.validUntil ? `<div class="valid-until">صالح حتى: ${data.validUntil}</div>` : ''}
                ${data.terms ? `<div class="terms">${data.terms}</div>` : ''}
                
                ${data.qrCodeUrl ? `
                <div class="qr-section">
                    <img src="${data.qrCodeUrl}" alt="QR Code" class="qr-image">
                </div>
                ` : ''}
            </div>
        </div>
    </div>
</body>
</html>
  `;
}
