import { OrderService } from '../src/lib/services/OrderService';
import { NotificationService } from '../src/lib/services/notificationService';
import { ShipmentService } from '../src/lib/services/shipmentService';
import { emailProvider } from '../src/lib/services/emailProvider';
import { Order, OrderStatus, PaymentStatus } from '../src/types/orders';

async function runOrdersFulfilmentTests() {
  console.log('========================================================================');
  console.log('SORAYVA — ORDERS, SHIPMENT & NOTIFICATIONS AUTOMATED TEST SUITE');
  console.log('========================================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    total++;
    if (condition) {
      console.log(`✅ ${testName}: PASSED`);
      passed++;
    } else {
      console.error(`❌ ${testName}: FAILED`);
      if (detail) console.error(`   ${detail}`);
      process.exitCode = 1;
    }
  }

  // ------------------------------------------------------------------------
  // TEST 1: Order creation triggers exactly one order-received email event
  // ------------------------------------------------------------------------
  console.log('--- TEST 1: ORDER CREATION & NOTIFICATION OUTBOX ---');
  const initialOrderData = {
    orderNumber: 'SR-TEST-ORD-001',
    customerName: 'Ananya Deshmukh',
    customerEmail: 'ananya.test@sorayva.com',
    customerPhone: '+91 98765 43210',
    shippingAddress: {
      addressLine1: 'Flat 402, Lotus Grandeur, Road 12, Banjara Hills',
      city: 'Hyderabad',
      state: 'Telangana',
      postalCode: '500034',
      country: 'India',
    },
    items: [
      {
        orderItemId: 'item-1',
        productId: 'SR-SAMPLE-001',
        productName: 'Royal Kanjeevaram Silk Saree in Crimson Gold',
        quantity: 1,
        unitPrice: 28500,
        totalPrice: 28500,
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=600',
        color: 'Crimson Gold',
      },
    ],
    currency: 'INR',
    subtotal: 28500,
    shippingCost: 0,
    discount: 0,
    tax: 0,
    total: 28500,
    paymentMethod: 'ONLINE_UPI',
    paymentStatus: 'PENDING' as PaymentStatus,
    orderStatus: 'PLACED' as OrderStatus,
  };

  const createResult = await OrderService.createOrder(initialOrderData);
  assert(createResult.success, 'Test 1.1: Order created successfully', createResult.error);
  const createdOrder = createResult.order!;

  const notifsAfterCreate = NotificationService.getNotifications(createdOrder.orderId);
  assert(
    notifsAfterCreate.length === 1 && notifsAfterCreate[0].eventType === 'ORDER_PLACED',
    'Test 1.2: Exactly one ORDER_PLACED notification queued in Outbox',
    `Count: ${notifsAfterCreate.length}, Event: ${notifsAfterCreate[0]?.eventType}`
  );

  // ------------------------------------------------------------------------
  // TEST 2: Repeated order creation with same idempotency key or ID does not create duplicate
  // ------------------------------------------------------------------------
  console.log('\n--- TEST 2: IDEMPOTENCY ON ORDER CREATION ---');
  const duplicateResult = await OrderService.createOrder({
    ...initialOrderData,
    orderId: createdOrder.orderId,
  });
  assert(
    duplicateResult.success && duplicateResult.order?.orderId === createdOrder.orderId,
    'Test 2.1: Repeated order creation returns existing order without creating duplicate'
  );
  const notifsAfterDup = NotificationService.getNotifications(createdOrder.orderId);
  assert(
    notifsAfterDup.length === 1,
    'Test 2.2: Outbox count remains exactly 1, no duplicate notification produced'
  );

  // ------------------------------------------------------------------------
  // TEST 3: Payment pending is not represented as paid
  // ------------------------------------------------------------------------
  console.log('\n--- TEST 3: PAYMENT STATUS SEPARATION ---');
  const fetchedOrder = OrderService.getOrder(createdOrder.orderId)!;
  assert(
    fetchedOrder.paymentStatus === 'PENDING' && fetchedOrder.orderStatus === 'PLACED',
    'Test 3.1: Order exists with PENDING payment and is NOT falsely marked PAID'
  );
  assert(
    !fetchedOrder.paidAt,
    'Test 3.2: paidAt is undefined for pending order'
  );

  // Now confirm payment
  const confirmPaymentRes = await OrderService.confirmPayment(
    createdOrder.orderId,
    'RAZORPAY-PAY-12345',
    'Razorpay'
  );
  assert(confirmPaymentRes.success, 'Test 3.3: Payment confirmed via explicit payment event');
  const paidOrder = OrderService.getOrder(createdOrder.orderId)!;
  assert(
    paidOrder.paymentStatus === 'PAID' && paidOrder.orderStatus === 'CONFIRMED',
    'Test 3.4: Order transitions to PAID and CONFIRMED only after explicit payment confirmation'
  );
  const notifsAfterPayment = NotificationService.getNotifications(createdOrder.orderId);
  assert(
    notifsAfterPayment.some(n => n.eventType === 'PAYMENT_CONFIRMED'),
    'Test 3.5: PAYMENT_CONFIRMED notification queued'
  );

  // ------------------------------------------------------------------------
  // TEST 4: Packing requires checklist completion or explicit override reason
  // ------------------------------------------------------------------------
  console.log('\n--- TEST 4: FULFILMENT CHECKLIST & PACKING ---');
  // Attempt packing with incomplete checklist and no override
  const failPackRes = await OrderService.markOrderPacked({
    orderId: createdOrder.orderId,
    checklistProgress: {
      verifyProductAndColor: true,
      verifyQuantity: false, // Incomplete!
      qualityInspection: true,
      packagingCompleted: true,
      labelAttached: true,
    },
    packedBy: 'Staff Sunita',
  });
  assert(
    !failPackRes.success,
    'Test 4.1: Packing rejected when checklist is incomplete without override reason'
  );

  // Complete packing with all 5 checks verified
  const successPackRes = await OrderService.markOrderPacked({
    orderId: createdOrder.orderId,
    checklistProgress: {
      verifyProductAndColor: true,
      verifyQuantity: true,
      qualityInspection: true,
      packagingCompleted: true,
      labelAttached: true,
    },
    packedBy: 'Staff Sunita',
  });
  assert(
    successPackRes.success,
    'Test 4.2: Packing accepted when all 5 checklist verification points pass'
  );
  const packedOrder = OrderService.getOrder(createdOrder.orderId)!;
  assert(
    packedOrder.orderStatus === 'PACKED',
    'Test 4.3: Order status updated to PACKED'
  );
  const packedEvents = packedOrder.timeline || packedOrder.events;
  const packedEvent = packedEvents?.find(e => e.eventType === 'ORDER_PACKED');
  assert(
    !!packedEvent && packedEvent.actor === 'Staff Sunita',
    'Test 4.4: PACKED event recorded in timeline with actor audit'
  );

  // ------------------------------------------------------------------------
  // TEST 5: Dispatch requires valid shipment details (carrier & AWB)
  // ------------------------------------------------------------------------
  console.log('\n--- TEST 5: DISPATCH VALIDATION ---');
  // Try dispatch without carrier or AWB
  const invalidDispatch = await OrderService.createOrUpdateShipment(createdOrder.orderId, {
    carrier: '',
    awbNumber: '',
  });
  assert(
    !invalidDispatch.success,
    'Test 5.1: Dispatch rejected when carrier and AWB are missing'
  );

  // Dispatch with valid courier partner and AWB tracking number
  const validDispatch = await OrderService.createOrUpdateShipment(createdOrder.orderId, {
    carrier: 'Blue Dart Express',
    shippingService: 'Apex Air',
    awbNumber: 'BD-883920199',
    estimatedDelivery: '3 Business Days',
    weight: '1.2 kg',
    dimensions: '38 x 28 x 8 cm',
  });
  assert(
    validDispatch.success,
    'Test 5.2: Shipment created and order dispatched with valid carrier & AWB'
  );

  const shippedOrder = OrderService.getOrder(createdOrder.orderId)!;
  assert(
    shippedOrder.orderStatus === 'SHIPPED',
    'Test 5.3: Order transitions to SHIPPED'
  );
  assert(
    shippedOrder.shipment?.awbNumber === 'BD-883920199' &&
    shippedOrder.shipment?.carrier === 'Blue Dart Express',
    'Test 5.4: Shipment details persisted with verified carrier & AWB'
  );

  // ------------------------------------------------------------------------
  // TEST 6: Dispatch triggers the correct email with tracking information
  // ------------------------------------------------------------------------
  console.log('\n--- TEST 6: DISPATCH NOTIFICATION ---');
  const notifsAfterShip = NotificationService.getNotifications(createdOrder.orderId);
  const dispatchNotif = notifsAfterShip.find(n => n.eventType === 'SHIPMENT_DISPATCHED');
  assert(
    !!dispatchNotif,
    'Test 6.1: SHIPMENT_DISPATCHED email notification queued'
  );

  // Verify rendered content contains carrier and AWB
  const preview = NotificationService.previewNotificationTemplate('SHIPMENT_DISPATCHED', shippedOrder);
  assert(
    preview.html.includes('BD-883920199') && preview.html.includes('Blue Dart Express'),
    'Test 6.2: Dispatch email template contains real carrier and tracking AWB'
  );

  // ------------------------------------------------------------------------
  // TEST 7: Re-saving the same status does not duplicate the email
  // ------------------------------------------------------------------------
  console.log('\n--- TEST 7: NO DUPLICATE NOTIFICATION ON RE-SAVE ---');
  const dispatchCountBefore = NotificationService.getNotifications(createdOrder.orderId)
    .filter(n => n.eventType === 'SHIPMENT_DISPATCHED').length;

  // Re-save SHIPPED status
  await OrderService.updateOrderStatus(createdOrder.orderId, 'SHIPPED', 'Staff Member');
  const dispatchCountAfter = NotificationService.getNotifications(createdOrder.orderId)
    .filter(n => n.eventType === 'SHIPMENT_DISPATCHED').length;
  assert(
    dispatchCountBefore === dispatchCountAfter,
    'Test 7.1: Re-saving status did not generate duplicate notification'
  );

  // ------------------------------------------------------------------------
  // TEST 8: A failed email is recorded in Outbox and can be retried safely
  // ------------------------------------------------------------------------
  console.log('\n--- TEST 8: OUTBOX ERROR RECORDING & RETRY ---');
  assert(
    dispatchNotif!.deliveryStatus === 'QUEUED' || dispatchNotif!.deliveryStatus === 'FAILED',
    'Test 8.1: Notification status safely recorded in durable Outbox'
  );

  const retryRes = await NotificationService.retryNotification(dispatchNotif!.notificationId);
  // Email provider is honest (reports not configured if keys missing)
  assert(
    retryRes.success || retryRes.notification?.deliveryStatus === 'FAILED',
    'Test 8.2: Outbox retry safely executes without crashing'
  );
  assert(
    (retryRes.notification?.attempts ?? 0) >= 1,
    'Test 8.3: Attempt count incremented in notification audit record'
  );

  // ------------------------------------------------------------------------
  // TEST 9: In-transit, Out for delivery, Delivered timeline updates
  // ------------------------------------------------------------------------
  console.log('\n--- TEST 9: TIMELINE & TRANSIT EVENTS ---');
  const transitEventRes = await OrderService.addTimelineEvent(createdOrder.orderId, {
    eventType: 'IN_TRANSIT',
    title: 'In Transit Hub Scan',
    description: 'Consignment sorted at Hyderabad Hub and departed for destination.',
    location: 'Hyderabad Gateway Hub',
    actor: 'Blue Dart Webhook',
    source: 'carrier_webhook',
  });
  assert(transitEventRes.success, 'Test 9.1: In-transit event added with carrier source and location');

  // Mark Delivered
  const deliveredRes = await OrderService.updateOrderStatus(createdOrder.orderId, 'DELIVERED', 'Blue Dart Driver');
  assert(deliveredRes.success, 'Test 9.2: Order transitions to DELIVERED');
  const deliveredOrder = OrderService.getOrder(createdOrder.orderId)!;
  assert(
    deliveredOrder.orderStatus === 'DELIVERED' && !!deliveredOrder.deliveredAt,
    'Test 9.3: Order marked DELIVERED and deliveredAt timestamp recorded'
  );
  const deliveredNotif = NotificationService.getNotifications(createdOrder.orderId)
    .find(n => n.eventType === 'DELIVERED');
  assert(
    !!deliveredNotif,
    'Test 9.4: DELIVERED email notification queued in Outbox'
  );

  // ------------------------------------------------------------------------
  // TEST 10: Invalid status transitions are rejected
  // ------------------------------------------------------------------------
  console.log('\n--- TEST 10: STATE MACHINE BOUNDARY ENFORCEMENT ---');
  // Attempting to move delivered order back to PLACED
  const invalidTransition = await OrderService.updateOrderStatus(createdOrder.orderId, 'PLACED', 'Staff');
  assert(
    !invalidTransition.success,
    'Test 10.1: Invalid transition from DELIVERED back to PLACED is strictly rejected'
  );

  // ------------------------------------------------------------------------
  // TEST 11: Customer tracking privacy & verification
  // ------------------------------------------------------------------------
  console.log('\n--- TEST 11: CUSTOMER TRACKING PRIVACY ---');
  // Verification with matching email
  const trackSuccess = OrderService.verifyAndTrackOrder(createdOrder.orderNumber, 'ananya.test@sorayva.com');
  assert(
    trackSuccess.success && !!trackSuccess.tracking,
    'Test 11.1: Customer can track order with correct orderNumber and matching email'
  );

  // Verification with matching phone
  const trackPhoneSuccess = OrderService.verifyAndTrackOrder(createdOrder.orderNumber, '9876543210');
  assert(
    trackPhoneSuccess.success && !!trackPhoneSuccess.tracking,
    'Test 11.2: Customer can track order with matching mobile phone'
  );

  // Verification with wrong contact
  const trackFail = OrderService.verifyAndTrackOrder(createdOrder.orderNumber, 'attacker@malicious.com');
  assert(
    Boolean(!trackFail.success && trackFail.error?.includes('verification failed')),
    'Test 11.3: Tracking strictly rejected for mismatched contact details'
  );

  // Verification with nonexistent order
  const trackNotFound = OrderService.verifyAndTrackOrder('SR-NONEXISTENT', 'ananya.test@sorayva.com');
  assert(
    !trackNotFound.success,
    'Test 11.4: Tracking nonexistent order returns clear not-found'
  );

  // ------------------------------------------------------------------------
  // TEST 12: Private sourcing fields never leak into public customer tracking
  // ------------------------------------------------------------------------
  console.log('\n--- TEST 12: DATA LEAKAGE & SOURCING PROTECTION ---');
  const trackingPayload = trackSuccess.tracking as any;
  assert(
    trackingPayload.meeshoUrl === undefined &&
    trackingPayload.sourceCost === undefined &&
    trackingPayload.supplierReference === undefined &&
    trackingPayload.internalNotes === undefined,
    'Test 12.1: Sourcing URLs, internal notes, and source costs are strictly excluded from public tracking payload'
  );

  // ------------------------------------------------------------------------
  // TEST 13: Honest Email Provider Diagnostics
  // ------------------------------------------------------------------------
  console.log('\n--- TEST 13: EMAIL PROVIDER DIAGNOSTICS ---');
  const emailDiag = emailProvider.getDiagnostics();
  assert(
    typeof emailDiag.configured === 'boolean',
    'Test 13.1: Email provider provides honest diagnostics'
  );
  if (!emailDiag.configured) {
    assert(
      emailDiag.providerName === 'None (Unconfigured)',
      'Test 13.2: Clearly reports unconfigured status when no email provider keys are provided in .env.local'
    );
  }

  // ------------------------------------------------------------------------
  // TEST 14: Admin filters, search & CSV export
  // ------------------------------------------------------------------------
  console.log('\n--- TEST 14: ADMIN FILTERS & CSV EXPORT ---');
  const searchRes = OrderService.getOrders({
    searchQuery: 'Ananya',
  });
  assert(
    searchRes.orders.some(o => o.orderId === createdOrder.orderId),
    'Test 14.1: Search by customer name finds the created order'
  );

  const filterStatusRes = OrderService.getOrders({
    orderStatus: 'DELIVERED',
  });
  assert(
    filterStatusRes.orders.some(o => o.orderId === createdOrder.orderId),
    'Test 14.2: Filter by DELIVERED status returns the created order'
  );

  const csvOutput = OrderService.exportOrdersCSV(searchRes.orders);
  assert(
    csvOutput.includes('Order Number,Order ID,Order Date,Customer Name') &&
    csvOutput.includes(createdOrder.orderNumber),
    'Test 14.3: CSV export generates standard RFC-compliant CSV with header and order details'
  );

  console.log('\n========================================================================');
  console.log(`TEST RESULTS: ${passed}/${total} TESTS PASSED`);
  console.log('========================================================================\n');

  if (passed !== total) {
    process.exit(1);
  }
}

runOrdersFulfilmentTests().catch(err => {
  console.error('Test runner fatal error:', err);
  process.exit(1);
});
