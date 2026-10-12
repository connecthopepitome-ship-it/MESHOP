import { Order, Shipment, OrderEvent, EmailTemplatePreview } from '@/types/orders';

const BRAND_COLORS = {
  warmIvory: '#F8F5F0',
  deepEspresso: '#2B211E',
  terracotta: '#B86F5D',
  champagne: '#D6B58A',
  softSage: '#748771',
  softSand: '#EEE7DD',
  white: '#FFFFFF',
  mutedText: '#6E625D',
};

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sorayva.com';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

function getEmailWrapper(title: string, preheader: string, contentHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: ${BRAND_COLORS.warmIvory};
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: ${BRAND_COLORS.deepEspresso};
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: ${BRAND_COLORS.warmIvory};
      padding: 30px 15px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: ${BRAND_COLORS.white};
      border: 1px solid rgba(214, 181, 138, 0.4);
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(43, 33, 30, 0.04);
    }
    .header {
      background-color: ${BRAND_COLORS.deepEspresso};
      padding: 32px 24px;
      text-align: center;
    }
    .brand-title {
      font-family: 'Bodoni Moda', 'Cormorant Garamond', Georgia, serif;
      font-size: 26px;
      letter-spacing: 4px;
      color: ${BRAND_COLORS.warmIvory};
      margin: 0;
      text-transform: uppercase;
      font-weight: 500;
    }
    .brand-sub {
      font-size: 10px;
      letter-spacing: 2px;
      color: ${BRAND_COLORS.champagne};
      margin-top: 6px;
      text-transform: uppercase;
    }
    .content {
      padding: 36px 32px;
    }
    .h1 {
      font-family: 'Bodoni Moda', 'Cormorant Garamond', Georgia, serif;
      font-size: 22px;
      color: ${BRAND_COLORS.deepEspresso};
      margin: 0 0 12px 0;
      font-weight: 500;
      line-height: 1.3;
    }
    .lead {
      font-size: 14px;
      line-height: 1.6;
      color: ${BRAND_COLORS.mutedText};
      margin: 0 0 24px 0;
    }
    .card {
      background-color: ${BRAND_COLORS.warmIvory};
      border: 1px solid rgba(214, 181, 138, 0.3);
      border-radius: 6px;
      padding: 20px;
      margin: 20px 0;
    }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 1px;
      text-transform: uppercase;
      border-radius: 4px;
      background-color: rgba(184, 111, 93, 0.12);
      color: ${BRAND_COLORS.terracotta};
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    .items-table th {
      text-align: left;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: ${BRAND_COLORS.mutedText};
      padding-bottom: 8px;
      border-bottom: 1px solid rgba(43, 33, 30, 0.1);
    }
    .items-table td {
      padding: 12px 0;
      font-size: 13px;
      border-bottom: 1px solid rgba(43, 33, 30, 0.06);
      vertical-align: middle;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      font-size: 13px;
      color: ${BRAND_COLORS.mutedText};
    }
    .total-row.grand {
      font-size: 16px;
      font-weight: 600;
      color: ${BRAND_COLORS.deepEspresso};
      border-top: 1px solid rgba(43, 33, 30, 0.15);
      padding-top: 12px;
      margin-top: 8px;
    }
    .btn {
      display: inline-block;
      background-color: ${BRAND_COLORS.deepEspresso};
      color: ${BRAND_COLORS.champagne} !important;
      text-decoration: none;
      padding: 14px 28px;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 2px;
      text-transform: uppercase;
      border-radius: 4px;
      text-align: center;
      margin: 20px 0 10px 0;
    }
    .footer {
      background-color: ${BRAND_COLORS.warmIvory};
      padding: 24px;
      text-align: center;
      font-size: 11px;
      color: ${BRAND_COLORS.mutedText};
      line-height: 1.6;
      border-top: 1px solid rgba(214, 181, 138, 0.3);
    }
    .preheader {
      display: none !important;
      visibility: hidden;
      mso-hide: all;
      font-size: 1px;
      line-height: 1px;
      max-height: 0;
      max-width: 0;
      opacity: 0;
      overflow: hidden;
    }
  </style>
</head>
<body>
  <span class="preheader">${preheader}</span>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1 class="brand-title">SORAYVA</h1>
        <div class="brand-sub">HAUTE COUTURE SAREES • ATELIER</div>
      </div>
      <div class="content">
        ${contentHtml}
      </div>
      <div class="footer">
        <p><strong>SORAYVA Heritage Atelier</strong></p>
        <p>For assistance, our concierge is available at <a href="mailto:concierge@sorayva.com" style="color:${BRAND_COLORS.terracotta};">concierge@sorayva.com</a> or WhatsApp +91 98765 43210.</p>
        <p style="margin-top:12px; font-size:10px; color:#999;">© ${new Date().getFullYear()} SORAYVA. All rights reserved. This is a transactional notification regarding order #${title}.</p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

function renderItemsHtml(items: Order['items']): string {
  if (!items || items.length === 0) return '<p>No items listed.</p>';
  return `
    <table class="items-table">
      <thead>
        <tr>
          <th>Saree</th>
          <th style="text-align:center;">Qty</th>
          <th style="text-align:right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${items.map(item => `
          <tr>
            <td>
              <strong>${item.name}</strong>
              ${item.selectedBlouseSize ? `<br><span style="font-size:11px; color:#888;">Blouse Size: ${item.selectedBlouseSize}</span>` : ''}
              ${item.sku ? `<br><span style="font-size:10px; color:#aaa;">SKU: ${item.sku}</span>` : ''}
            </td>
            <td style="text-align:center;">${item.quantity}</td>
            <td style="text-align:right; font-weight:500;">${formatCurrency(item.price * item.quantity)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function renderAddressHtml(addr: Order['shippingAddress']): string {
  return `
    <div style="font-size:13px; line-height:1.5; color:${BRAND_COLORS.mutedText};">
      <strong style="color:${BRAND_COLORS.deepEspresso};">${addr.fullName}</strong><br>
      ${addr.addressLine1}${addr.addressLine2 ? ', ' + addr.addressLine2 : ''}<br>
      ${addr.city}, ${addr.state} - ${addr.pincode}<br>
      ${addr.country} • Phone: ${addr.mobile}
    </div>
  `;
}

// 1. Order Placed
export function generateOrderPlacedEmail(order: Order): EmailTemplatePreview {
  const subject = `We've received your SORAYVA order #${order.orderNumber}`;
  const paymentNotice = order.paymentMethod === 'cod'
    ? 'Payment mode: Cash on Delivery (₹' + order.total.toLocaleString('en-IN') + ' to be collected upon arrival).'
    : order.paymentStatus === 'PAID'
    ? 'Payment confirmed via secure gateway.'
    : 'Payment status: Pending confirmation.';

  const contentHtml = `
    <span class="badge">Order Placed</span>
    <h2 class="h1" style="margin-top:12px;">Thank you for your order, ${order.customerName}.</h2>
    <p class="lead">
      We are delighted to receive your order <strong>#${order.orderNumber}</strong>. Our artisans and styling concierge are preparing your handpicked saree selection for verification.
    </p>

    <div class="card">
      <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
        <span style="font-size:12px; color:${BRAND_COLORS.mutedText};">Order Reference:</span>
        <strong style="font-size:12px; color:${BRAND_COLORS.deepEspresso};">${order.orderNumber}</strong>
      </div>
      <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
        <span style="font-size:12px; color:${BRAND_COLORS.mutedText};">Order Date:</span>
        <span style="font-size:12px; color:${BRAND_COLORS.deepEspresso};">${new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
      </div>
      <div style="display:flex; justify-content:space-between;">
        <span style="font-size:12px; color:${BRAND_COLORS.mutedText};">Payment Notice:</span>
        <span style="font-size:12px; color:${BRAND_COLORS.terracotta}; font-weight:600;">${paymentNotice}</span>
      </div>
    </div>

    <h3 style="font-size:14px; text-transform:uppercase; letter-spacing:1px; margin-top:24px; color:${BRAND_COLORS.deepEspresso};">Items in your Order</h3>
    ${renderItemsHtml(order.items)}

    <div style="margin: 20px 0; background-color:#FAFAFA; padding:16px; border-radius:6px;">
      <div class="total-row"><span>Subtotal:</span><span>${formatCurrency(order.subtotal)}</span></div>
      ${order.discount > 0 ? `<div class="total-row" style="color:${BRAND_COLORS.terracotta};"><span>Discount:</span><span>-${formatCurrency(order.discount)}</span></div>` : ''}
      <div class="total-row"><span>Shipping:</span><span>${order.shipping === 0 ? 'Complimentary' : formatCurrency(order.shipping)}</span></div>
      <div class="total-row grand"><span>Total:</span><span>${formatCurrency(order.total)}</span></div>
    </div>

    <h3 style="font-size:14px; text-transform:uppercase; letter-spacing:1px; margin-top:24px; color:${BRAND_COLORS.deepEspresso};">Shipping Address</h3>
    <div class="card">
      ${renderAddressHtml(order.shippingAddress)}
    </div>

    <div style="text-align:center; margin-top:28px;">
      <a href="${BASE_URL}/track-order?id=${order.orderNumber}" class="btn">View & Track Order</a>
    </div>
  `;

  const htmlContent = getEmailWrapper(order.orderNumber, `Order #${order.orderNumber} placed successfully with SORAYVA.`, contentHtml);
  const plainText = `SORAYVA - Order #${order.orderNumber} Received\n\nDear ${order.customerName},\nThank you for choosing SORAYVA. Your order #${order.orderNumber} has been recorded.\nTotal: ${formatCurrency(order.total)}\nTrack your order: ${BASE_URL}/track-order?id=${order.orderNumber}`;

  return { templateId: 'ORDER_PLACED', subject, htmlContent, plainText };
}

// 2. Payment Confirmed
export function generatePaymentConfirmedEmail(order: Order): EmailTemplatePreview {
  const subject = `Payment confirmed for SORAYVA order #${order.orderNumber}`;
  const contentHtml = `
    <span class="badge" style="background-color:rgba(116, 135, 113, 0.15); color:${BRAND_COLORS.softSage};">Payment Received</span>
    <h2 class="h1" style="margin-top:12px;">Payment Successful</h2>
    <p class="lead">
      We have successfully received payment of <strong>${formatCurrency(order.total)}</strong> for order <strong>#${order.orderNumber}</strong>.
      ${order.paymentReference ? `Payment Gateway Ref: ${order.paymentReference}` : ''}
    </p>

    <div class="card">
      <p style="margin:0; font-size:13px; color:${BRAND_COLORS.deepEspresso};">
        Your payment has been cleared by our billing department. Your order is now prioritized for curation and quality inspection.
      </p>
    </div>

    <div style="text-align:center; margin-top:24px;">
      <a href="${BASE_URL}/track-order?id=${order.orderNumber}" class="btn">View Order Status</a>
    </div>
  `;

  const htmlContent = getEmailWrapper(order.orderNumber, `Payment confirmed for SORAYVA order #${order.orderNumber}`, contentHtml);
  const plainText = `SORAYVA - Payment Confirmed\n\nOrder #${order.orderNumber}\nAmount Paid: ${formatCurrency(order.total)}\nStatus: Paid\nTrack: ${BASE_URL}/track-order?id=${order.orderNumber}`;
  return { templateId: 'PAYMENT_CONFIRMED', subject, htmlContent, plainText };
}

// 3. Order Packed
export function generateOrderPackedEmail(order: Order): EmailTemplatePreview {
  const subject = `Your SORAYVA order #${order.orderNumber} is carefully packed`;
  const contentHtml = `
    <span class="badge">Atelier Inspected</span>
    <h2 class="h1" style="margin-top:12px;">Prepared with Care</h2>
    <p class="lead">
      Great news! Each saree in order <strong>#${order.orderNumber}</strong> has successfully completed rigorous fabric and embroidery inspection, been wrapped in protective mulberry paper, and packed into our signature keepsake box.
    </p>

    <div class="card">
      <p style="margin:0; font-size:13px; color:${BRAND_COLORS.deepEspresso};">
        Your shipment is now staged in our fulfilment bay awaiting carrier pickup. You will receive tracking credentials as soon as the courier scans the parcel.
      </p>
    </div>

    <div style="text-align:center; margin-top:24px;">
      <a href="${BASE_URL}/track-order?id=${order.orderNumber}" class="btn">Check Fulfilment Progress</a>
    </div>
  `;

  const htmlContent = getEmailWrapper(order.orderNumber, `Your order #${order.orderNumber} has been packed with care.`, contentHtml);
  const plainText = `SORAYVA - Order #${order.orderNumber} Packed\n\nYour order has been inspected and boxed in our signature luxury packaging. It is scheduled for courier dispatch.\nTrack: ${BASE_URL}/track-order?id=${order.orderNumber}`;
  return { templateId: 'ORDER_PACKED', subject, htmlContent, plainText };
}

// 4. Shipment Dispatched
export function generateOrderDispatchedEmail(order: Order, shipment?: Shipment): EmailTemplatePreview {
  const subject = `Your SORAYVA order #${order.orderNumber} is on its way`;
  const carrier = shipment?.carrier || 'Express Courier';
  const awb = shipment?.awbNumber || 'Assigned';
  const trackingUrl = shipment?.trackingUrl || `${BASE_URL}/track-order?id=${order.orderNumber}`;

  const contentHtml = `
    <span class="badge" style="background-color:rgba(184, 111, 93, 0.15); color:${BRAND_COLORS.terracotta};">Dispatched</span>
    <h2 class="h1" style="margin-top:12px;">Your Saree Has Been Dispatched</h2>
    <p class="lead">
      Order <strong>#${order.orderNumber}</strong> has left our atelier and is en route with <strong>${carrier}</strong>.
    </p>

    <div class="card">
      <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
        <span style="font-size:12px; color:${BRAND_COLORS.mutedText};">Courier Partner:</span>
        <strong style="font-size:13px; color:${BRAND_COLORS.deepEspresso};">${carrier}</strong>
      </div>
      <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
        <span style="font-size:12px; color:${BRAND_COLORS.mutedText};">AWB / Tracking Number:</span>
        <strong style="font-size:13px; color:${BRAND_COLORS.terracotta}; font-family:monospace;">${awb}</strong>
      </div>
      ${shipment?.estimatedDelivery ? `
      <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
        <span style="font-size:12px; color:${BRAND_COLORS.mutedText};">Estimated Delivery:</span>
        <span style="font-size:12px; color:${BRAND_COLORS.deepEspresso}; font-weight:600;">${new Date(shipment.estimatedDelivery).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
      </div>` : ''}
    </div>

    <div style="text-align:center; margin-top:28px;">
      <a href="${trackingUrl}" class="btn">Track Shipment Real-Time</a>
    </div>
  `;

  const htmlContent = getEmailWrapper(order.orderNumber, `Order #${order.orderNumber} dispatched with ${carrier}. Tracking: ${awb}`, contentHtml);
  const plainText = `SORAYVA - Order #${order.orderNumber} Dispatched\n\nCarrier: ${carrier}\nAWB / Tracking: ${awb}\nTrack link: ${trackingUrl}`;
  return { templateId: 'SHIPMENT_DISPATCHED', subject, htmlContent, plainText };
}

// 5. Out For Delivery
export function generateOutForDeliveryEmail(order: Order, shipment?: Shipment): EmailTemplatePreview {
  const subject = `Out for delivery: SORAYVA order #${order.orderNumber}`;
  const contentHtml = `
    <span class="badge" style="background-color:rgba(184, 111, 93, 0.15); color:${BRAND_COLORS.terracotta};">Out For Delivery</span>
    <h2 class="h1" style="margin-top:12px;">Arriving Today</h2>
    <p class="lead">
      Your SORAYVA parcel for order <strong>#${order.orderNumber}</strong> is in the courier delivery van and scheduled to arrive today at your doorstep.
    </p>

    <div class="card">
      <p style="margin:0; font-size:13px; color:${BRAND_COLORS.deepEspresso};">
        ${order.paymentMethod === 'cod' ? `<strong>Reminder:</strong> This is a Cash on Delivery shipment. Please keep <strong>${formatCurrency(order.total)}</strong> ready.` : 'All payments are fully settled. Please ensure someone is available at the address to sign for the luxury package.'}
      </p>
    </div>

    <div style="text-align:center; margin-top:24px;">
      <a href="${BASE_URL}/track-order?id=${order.orderNumber}" class="btn">Track Delivery Vehicle</a>
    </div>
  `;

  const htmlContent = getEmailWrapper(order.orderNumber, `Order #${order.orderNumber} is out for delivery today.`, contentHtml);
  const plainText = `SORAYVA - Order #${order.orderNumber} Out For Delivery\n\nYour order is expected to arrive today.\nTrack: ${BASE_URL}/track-order?id=${order.orderNumber}`;
  return { templateId: 'OUT_FOR_DELIVERY', subject, htmlContent, plainText };
}

// 6. Delivered
export function generateOrderDeliveredEmail(order: Order, shipment?: Shipment): EmailTemplatePreview {
  const subject = `Delivered: SORAYVA order #${order.orderNumber}`;
  const contentHtml = `
    <span class="badge" style="background-color:rgba(116, 135, 113, 0.15); color:${BRAND_COLORS.softSage};">Delivered</span>
    <h2 class="h1" style="margin-top:12px;">Your Saree Has Arrived</h2>
    <p class="lead">
      Our delivery partner confirms that order <strong>#${order.orderNumber}</strong> has been safely handed over.
    </p>

    <div class="card">
      <p style="margin:0; font-size:13px; color:${BRAND_COLORS.deepEspresso};">
        We hope your new SORAYVA saree brings grace, splendor, and joy to your special occasions. We would be honored to assist you with styling or draping advice.
      </p>
    </div>

    <div style="text-align:center; margin-top:24px;">
      <a href="${BASE_URL}/account/orders/${order.orderId}" class="btn">View Order & Feedback</a>
    </div>
  `;

  const htmlContent = getEmailWrapper(order.orderNumber, `Order #${order.orderNumber} has been delivered.`, contentHtml);
  const plainText = `SORAYVA - Order #${order.orderNumber} Delivered\n\nThank you for choosing SORAYVA. Your package has been delivered.\nView: ${BASE_URL}/account/orders/${order.orderId}`;
  return { templateId: 'DELIVERED', subject, htmlContent, plainText };
}

// 7. Cancelled
export function generateOrderCancelledEmail(order: Order, reason?: string): EmailTemplatePreview {
  const subject = `Notice of Cancellation: SORAYVA order #${order.orderNumber}`;
  const contentHtml = `
    <span class="badge" style="background-color:rgba(184, 50, 50, 0.12); color:#B83232;">Order Cancelled</span>
    <h2 class="h1" style="margin-top:12px;">Order Cancellation Confirmation</h2>
    <p class="lead">
      Order <strong>#${order.orderNumber}</strong> has been cancelled.
      ${reason ? `<br><span style="font-size:13px; color:${BRAND_COLORS.mutedText};">Reason: ${reason}</span>` : ''}
    </p>

    <div class="card">
      <p style="margin:0; font-size:13px; color:${BRAND_COLORS.deepEspresso};">
        ${order.paymentStatus === 'PAID' ? 'If you made an online payment, a refund of ' + formatCurrency(order.total) + ' has been initiated to your original payment method and typically reflects within 5–7 business days.' : 'No charges were incurred for this order.'}
      </p>
    </div>
  `;

  const htmlContent = getEmailWrapper(order.orderNumber, `Order #${order.orderNumber} has been cancelled.`, contentHtml);
  const plainText = `SORAYVA - Order #${order.orderNumber} Cancelled\n\nYour order has been cancelled.\nReason: ${reason || 'Customer/Admin request'}`;
  return { templateId: 'ORDER_CANCELLED', subject, htmlContent, plainText };
}
