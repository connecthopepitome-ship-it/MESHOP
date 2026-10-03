/**
 * SORAYVA — GOOGLE SHEETS PRODUCT CATALOGUE CMS API
 * Google Apps Script Backend & Public Web App Endpoint
 *
 * SPREADSHEET: SORAYVA_PRODUCT_CATALOGUE
 * SHEET: PRODUCTS
 *
 * PUBLIC ENDPOINT (GET):
 * Strips all internal supplier details:
 * - Meesho Reference Link
 * - Source Cost
 * - Source Status
 * - Supplier Reference
 * - Last Source Check
 * These fields are NEVER returned in the public payload.
 *
 * ADMIN ENDPOINT (POST/GET with Admin Key):
 * Supports secure two-way read/write operations for store administrators.
 */

// Column indexes (1-based matching spreadsheet columns)
var COL = {
  PRODUCT_ID: 1,
  PRODUCT_NAME: 2,
  SHORT_DESCRIPTION: 3,
  CATEGORY: 4,
  SUBCATEGORY: 5,
  FABRIC: 6,
  OCCASION: 7,
  STYLE: 8,
  WORK: 9,
  PATTERN: 10,
  COLOUR: 11,
  COLOUR_FAMILY: 12,
  COLLECTION: 13,
  PRICE: 14,
  COMPARE_AT_PRICE: 15,
  STOCK: 16,
  STATUS: 17,
  FEATURED: 18,
  NEW_ARRIVAL: 19,
  TRENDING: 20,
  PUBLISH_DATE: 21,
  MAIN_IMAGE_URL: 22,
  IMAGE_2_URL: 23,
  IMAGE_3_URL: 24,
  IMAGE_4_URL: 25,
  SIZE_TYPE: 26,
  BLOUSE_SIZE: 27,
  SIZE_CHART: 28,
  SHIPPING_INFO: 29,
  RETURN_INFO: 30,
  RATING: 31,
  REVIEW_COUNT: 32,
  // INTERNAL PRIVATE FIELDS (NEVER EXPOSE IN PUBLIC API)
  MEESHO_REFERENCE_LINK: 33,
  SOURCE_COST: 34,
  SOURCE_STATUS: 35,
  SUPPLIER_REFERENCE: 36,
  LAST_SOURCE_CHECK: 37,
  // AUDIT FIELDS
  LAST_MODIFIED: 38
};

var ADMIN_KEY = 'sorayva_admin_secret_key_2026';
var CACHE_KEY = 'sorayva_public_products_v1';

/**
 * Main Web App Entrypoint (HTTP GET)
 */
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'getProducts';
  var forceRefresh = (e && e.parameter && (e.parameter.refresh === 'true' || e.parameter.refresh === '1'));
  var cache = CacheService.getScriptCache();

  // Return cached result if available for public getProducts action
  if (action === 'getProducts' && !forceRefresh) {
    var cachedResponse = cache.get(CACHE_KEY);
    if (cachedResponse) {
      return ContentService
        .createTextOutput(cachedResponse)
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  var response;

  try {
    if (action === 'getProducts') {
      response = getPublicProducts();
      // Store in script cache for 300 seconds (5 minutes)
      if (response && response.success) {
        try {
          cache.put(CACHE_KEY, JSON.stringify(response), 300);
        } catch (cacheErr) {
          Logger.log('Cache storage note: ' + cacheErr.toString());
        }
      }
    } else if (action === 'getAdminProducts') {
      response = getAdminProductsResponse(e);
    } else if (action === 'getCategories') {
      response = getDynamicCategoriesResponse();
    } else if (action === 'getCollections') {
      response = getDynamicCollectionsResponse();
    } else if (action === 'getCatalogueHealthReport') {
      response = generateCatalogueHealthReport();
    } else if (action === 'clearCache') {
      cache.remove(CACHE_KEY);
      response = { success: true, message: 'Catalogue cache invalidated successfully.' };
    } else if (action === 'health') {
      response = { status: 'OK', system: 'SORAYVA Catalogue CMS API', timestamp: new Date().toISOString() };
    } else {
      response = getPublicProducts();
    }
  } catch (err) {
    response = {
      success: false,
      error: true,
      message: 'Catalogue Service Error: ' + err.toString(),
      products: [],
      meta: { count: 0, generatedAt: new Date().toISOString() }
    };
  }

  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Main Web App Entrypoint (HTTP POST) — Admin Write Operations
 */
function doPost(e) {
  var response;
  try {
    var payload = {};
    if (e && e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    }

    var action = payload.action || (e && e.parameter && e.parameter.action);

    if (action === 'saveProduct' || action === 'createProduct' || action === 'updateProduct') {
      response = saveOrUpdateProductRow(payload.product || payload);
    } else if (action === 'updateStatus') {
      response = updateProductStatusRow(payload.productId, payload.status);
    } else if (action === 'archiveProduct') {
      response = updateProductStatusRow(payload.productId, 'Discontinued');
    } else if (action === 'clearCache') {
      CacheService.getScriptCache().remove(CACHE_KEY);
      response = { success: true, message: 'Catalogue cache cleared.' };
    } else {
      response = { success: false, error: 'Unknown POST action: ' + action };
    }
  } catch (err) {
    response = { success: false, error: 'POST Processing Error: ' + err.toString() };
  }

  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Reads PRODUCTS sheet and returns ONLY public products (Active or Out of Stock)
 * EXCLUDES all internal supplier fields.
 */
function getPublicProducts() {
  var sheet = getProductsSheet();
  var nowIso = new Date().toISOString();

  if (!sheet) {
    return { success: true, products: [], data: [], meta: { count: 0, generatedAt: nowIso } };
  }

  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    return { success: true, products: [], data: [], meta: { count: 0, generatedAt: nowIso } };
  }

  var publicProducts = [];
  var seenIds = {};

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var validation = validateRow(row);

    if (validation.isValid) {
      var productId = String(row[COL.PRODUCT_ID - 1] || '').trim();
      if (seenIds[productId]) continue;
      seenIds[productId] = true;

      var status = String(row[COL.STATUS - 1] || 'Draft').trim();
      if (status === 'Active' || status === 'Out of Stock') {
        var publicProduct = parsePublicProductRow(row);
        if (publicProduct) {
          publicProducts.push(publicProduct);
        }
      }
    }
  }

  return {
    success: true,
    products: publicProducts,
    data: publicProducts,
    meta: { count: publicProducts.length, generatedAt: nowIso }
  };
}

/**
 * Reads PRODUCTS sheet for ADMIN DASHBOARD ONLY (Includes internal fields)
 */
function getAdminProductsResponse(e) {
  var sheet = getProductsSheet();
  if (!sheet) return { success: false, error: 'Sheet not found' };

  var data = sheet.getDataRange().getValues();
  var adminProducts = [];

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var productId = String(row[COL.PRODUCT_ID - 1] || '').trim();
    if (!productId) continue;

    var p = parseAdminProductRow(row);
    if (p) adminProducts.push(p);
  }

  return {
    success: true,
    count: adminProducts.length,
    products: adminProducts
  };
}

/**
 * Saves (Creates or Updates) a product row in Google Sheets by exact Product ID
 */
function saveOrUpdateProductRow(productData) {
  if (!productData || !productData.productId) {
    return { success: false, error: 'Product ID is required for saving.' };
  }

  var sheet = getProductsSheet();
  if (!sheet) return { success: false, error: 'PRODUCTS sheet not found.' };

  var productId = String(productData.productId).trim();
  var data = sheet.getDataRange().getValues();
  var rowIndex = -1;

  // Search for existing Product ID row (Skip header row 0)
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][COL.PRODUCT_ID - 1] || '').trim().toLowerCase() === productId.toLowerCase()) {
      rowIndex = i + 1; // 1-based row index in Spreadsheet
      break;
    }
  }

  var existingRow = (rowIndex > 0) ? data[rowIndex - 1] : [];
  var newRow = buildRowFromProductData(productData, existingRow);

  if (rowIndex > 0) {
    // Update exact matching row
    var range = sheet.getRange(rowIndex, 1, 1, newRow.length);
    range.setValues([newRow]);
  } else {
    // Append new row
    sheet.appendRow(newRow);
  }

  // Invalidate public script cache
  CacheService.getScriptCache().remove(CACHE_KEY);

  return {
    success: true,
    message: rowIndex > 0 ? 'Product updated successfully in Google Sheets.' : 'New product created successfully in Google Sheets.',
    productId: productId,
    cacheStatus: 'Catalogue Cache Invalidated'
  };
}

/**
 * Updates status of a product by Product ID
 */
function updateProductStatusRow(productId, newStatus) {
  if (!productId || !newStatus) return { success: false, error: 'Product ID and Status required.' };

  var sheet = getProductsSheet();
  if (!sheet) return { success: false, error: 'PRODUCTS sheet not found.' };

  var data = sheet.getDataRange().getValues();
  var rowIndex = -1;

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][COL.PRODUCT_ID - 1] || '').trim().toLowerCase() === String(productId).trim().toLowerCase()) {
      rowIndex = i + 1;
      break;
    }
  }

  if (rowIndex <= 0) return { success: false, error: 'Product ID "' + productId + '" not found.' };

  sheet.getRange(rowIndex, COL.STATUS).setValue(newStatus);
  sheet.getRange(rowIndex, COL.LAST_MODIFIED).setValue(new Date().toISOString());

  CacheService.getScriptCache().remove(CACHE_KEY);

  return {
    success: true,
    message: 'Status updated to ' + newStatus + ' in Google Sheets.',
    productId: productId
  };
}

/**
 * Builds a 38-column row array for spreadsheet writing, preserving existing row data for omitted fields
 */
function buildRowFromProductData(p, existingRow) {
  existingRow = existingRow || [];

  function getVal(fieldVal, colIdx, defaultVal) {
    if (fieldVal !== undefined && fieldVal !== null) {
      if (Array.isArray(fieldVal)) return fieldVal.join(', ');
      return fieldVal;
    }
    if (existingRow.length >= colIdx && existingRow[colIdx - 1] !== undefined) {
      return existingRow[colIdx - 1];
    }
    return defaultVal || '';
  }

  var row = new Array(38);
  row[COL.PRODUCT_ID - 1] = getVal(p.productId, COL.PRODUCT_ID, '');
  row[COL.PRODUCT_NAME - 1] = getVal(p.productName || p.name, COL.PRODUCT_NAME, '');
  row[COL.SHORT_DESCRIPTION - 1] = getVal(p.shortDescription || p.description, COL.SHORT_DESCRIPTION, '');
  row[COL.CATEGORY - 1] = getVal(p.category, COL.CATEGORY, 'Silk Sarees');
  row[COL.SUBCATEGORY - 1] = getVal(p.subcategory, COL.SUBCATEGORY, '');
  row[COL.FABRIC - 1] = getVal(p.fabric, COL.FABRIC, 'Silk');
  row[COL.OCCASION - 1] = getVal(p.occasion, COL.OCCASION, '');
  row[COL.STYLE - 1] = getVal(p.style, COL.STYLE, '');
  row[COL.WORK - 1] = getVal(p.work || p.workType, COL.WORK, '');
  row[COL.PATTERN - 1] = getVal(p.pattern, COL.PATTERN, '');
  row[COL.COLOUR - 1] = getVal(p.colour, COL.COLOUR, '');
  row[COL.COLOUR_FAMILY - 1] = getVal(p.colourFamily, COL.COLOUR_FAMILY, '');
  row[COL.COLLECTION - 1] = getVal(p.collection, COL.COLLECTION, '');
  row[COL.PRICE - 1] = getVal(p.price, COL.PRICE, 0);
  row[COL.COMPARE_AT_PRICE - 1] = getVal(p.compareAtPrice, COL.COMPARE_AT_PRICE, '');
  row[COL.STOCK - 1] = getVal(p.stock !== undefined ? p.stock : p.stockQty, COL.STOCK, 5);
  row[COL.STATUS - 1] = getVal(p.status, COL.STATUS, 'Draft');
  row[COL.FEATURED - 1] = p.featured ? 'TRUE' : 'FALSE';
  row[COL.NEW_ARRIVAL - 1] = p.newArrival ? 'TRUE' : 'FALSE';
  row[COL.TRENDING - 1] = p.trending ? 'TRUE' : 'FALSE';
  row[COL.PUBLISH_DATE - 1] = getVal(p.publishDate, COL.PUBLISH_DATE, new Date().toISOString().split('T')[0]);
  
  // Images
  var imgs = p.images || p.galleryImages || [];
  row[COL.MAIN_IMAGE_URL - 1] = p.mainImage || (imgs.length > 0 ? imgs[0] : getVal('', COL.MAIN_IMAGE_URL, ''));
  row[COL.IMAGE_2_URL - 1] = (imgs.length > 1 ? imgs[1] : getVal('', COL.IMAGE_2_URL, ''));
  row[COL.IMAGE_3_URL - 1] = (imgs.length > 2 ? imgs[2] : getVal('', COL.IMAGE_3_URL, ''));
  row[COL.IMAGE_4_URL - 1] = (imgs.length > 3 ? imgs[3] : getVal('', COL.IMAGE_4_URL, ''));

  row[COL.SIZE_TYPE - 1] = getVal(p.sizeType, COL.SIZE_TYPE, 'Standard Saree (5.5m)');
  row[COL.BLOUSE_SIZE - 1] = getVal(p.blouseSize, COL.BLOUSE_SIZE, 'Unstitched');
  row[COL.SIZE_CHART - 1] = getVal(p.sizeChart, COL.SIZE_CHART, 'Saree: 5.5m | Blouse: 0.8m');
  row[COL.SHIPPING_INFO - 1] = getVal(p.shippingInfo, COL.SHIPPING_INFO, 'Complimentary insured shipping across India.');
  row[COL.RETURN_INFO - 1] = getVal(p.returnInfo, COL.RETURN_INFO, '7 days easy returns & exchange.');
  row[COL.RATING - 1] = getVal(p.rating, COL.RATING, 4.8);
  row[COL.REVIEW_COUNT - 1] = getVal(p.reviewCount, COL.REVIEW_COUNT, 12);

  // INTERNAL SOURCING FIELDS (PRESERVE EXISTING UNLESS EXPLICITLY PROVIDED)
  row[COL.MEESHO_REFERENCE_LINK - 1] = getVal(p.meeshoReferenceLink, COL.MEESHO_REFERENCE_LINK, '');
  row[COL.SOURCE_COST - 1] = getVal(p.sourceCost, COL.SOURCE_COST, '');
  row[COL.SOURCE_STATUS - 1] = getVal(p.sourceStatus, COL.SOURCE_STATUS, '');
  row[COL.SUPPLIER_REFERENCE - 1] = getVal(p.supplierReference, COL.SUPPLIER_REFERENCE, '');
  row[COL.LAST_SOURCE_CHECK - 1] = getVal(p.lastSourceCheck, COL.LAST_SOURCE_CHECK, new Date().toISOString().split('T')[0]);
  row[COL.LAST_MODIFIED - 1] = new Date().toISOString();

  return row;
}

/**
 * Validates a spreadsheet row against required catalog constraints
 */
function validateRow(row) {
  var productId = String(row[COL.PRODUCT_ID - 1] || '').trim();
  var productName = String(row[COL.PRODUCT_NAME - 1] || '').trim();
  var category = String(row[COL.CATEGORY - 1] || '').trim();
  var priceRaw = row[COL.PRICE - 1];
  var status = String(row[COL.STATUS - 1] || '').trim();
  var mainImage = String(row[COL.MAIN_IMAGE_URL - 1] || '').trim();

  if (!productId) return { isValid: false, reason: 'INVALID_PRODUCT_ID' };
  if (!productName) return { isValid: false, reason: 'MISSING_NAME' };
  if (!category) return { isValid: false, reason: 'MISSING_CATEGORY' };

  var price = parseFloat(priceRaw);
  if (isNaN(price) || price < 0) return { isValid: false, reason: 'INVALID_PRICE' };

  var validStatuses = ['Draft', 'Active', 'Out of Stock', 'Hidden', 'Discontinued'];
  if (validStatuses.indexOf(status) === -1) return { isValid: false, reason: 'INVALID_STATUS' };

  if (!mainImage || mainImage.indexOf('http') !== 0) return { isValid: false, reason: 'MISSING_IMAGE' };

  return { isValid: true, reason: 'VALID' };
}

/**
 * Converts a raw spreadsheet row into a PUBLIC PRODUCT DTO.
 * ABSOLUTELY NO INTERNAL SUPPLIER FIELDS ARE INCLUDED HERE.
 */
function parsePublicProductRow(row) {
  try {
    var productId = String(row[COL.PRODUCT_ID - 1] || '').trim();
    var productName = String(row[COL.PRODUCT_NAME - 1] || '').trim();
    var price = parseFloat(row[COL.PRICE - 1]) || 0;
    var compareAtPriceRaw = row[COL.COMPARE_AT_PRICE - 1];
    var compareAtPrice = (compareAtPriceRaw !== '' && !isNaN(parseFloat(compareAtPriceRaw))) ? parseFloat(compareAtPriceRaw) : undefined;
    
    if (compareAtPrice !== undefined && compareAtPrice <= price) {
      compareAtPrice = undefined;
    }

    var discountPercentage = (compareAtPrice && compareAtPrice > price) 
      ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
      : undefined;

    var stock = parseInt(row[COL.STOCK - 1], 10);
    if (isNaN(stock)) stock = 5;

    var status = String(row[COL.STATUS - 1] || 'Active').trim();
    var stockStatus = (status === 'Out of Stock' || stock <= 0) ? 'out_of_stock' : (stock <= 3 ? 'low_stock' : 'in_stock');

    var occasion = parseMultiValue(row[COL.OCCASION - 1]);
    var style = parseMultiValue(row[COL.STYLE - 1]);
    var work = parseMultiValue(row[COL.WORK - 1]);
    var pattern = parseMultiValue(row[COL.PATTERN - 1]);
    var collection = parseMultiValue(row[COL.COLLECTION - 1]);
    var blouseSize = parseMultiValue(row[COL.BLOUSE_SIZE - 1]);

    var images = [];
    var img1 = String(row[COL.MAIN_IMAGE_URL - 1] || '').trim();
    var img2 = String(row[COL.IMAGE_2_URL - 1] || '').trim();
    var img3 = String(row[COL.IMAGE_3_URL - 1] || '').trim();
    var img4 = String(row[COL.IMAGE_4_URL - 1] || '').trim();

    if (img1) images.push(img1);
    if (img2) images.push(img2);
    if (img3) images.push(img3);
    if (img4) images.push(img4);

    if (images.length === 0) {
      images.push('https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80');
    }

    var mainImage = images[0];
    var rating = parseFloat(row[COL.RATING - 1]);
    if (isNaN(rating) || rating <= 0) rating = 4.8;

    var reviewCount = parseInt(row[COL.REVIEW_COUNT - 1], 10);
    if (isNaN(reviewCount) || reviewCount < 0) reviewCount = 12;

    var slug = slugify(productName) + '-' + productId.toLowerCase();

    // PUBLIC DTO: NO INTERNAL FIELDS INCLUDED
    var dto = {
      productId: productId,
      productName: productName,
      name: productName,
      slug: slug,
      shortDescription: String(row[COL.SHORT_DESCRIPTION - 1] || '').trim(),
      description: String(row[COL.SHORT_DESCRIPTION - 1] || 'Handcrafted luxury saree from SORAYVA.').trim(),
      category: String(row[COL.CATEGORY - 1] || 'Silk Sarees').trim(),
      subcategory: String(row[COL.SUBCATEGORY - 1] || '').trim(),
      fabric: String(row[COL.FABRIC - 1] || 'Silk').trim(),
      occasion: occasion,
      style: style,
      work: work,
      pattern: pattern,
      colour: String(row[COL.COLOUR - 1] || 'Crimson').trim(),
      colourFamily: String(row[COL.COLOUR_FAMILY - 1] || '').trim(),
      collection: collection,
      price: price,
      compareAtPrice: compareAtPrice,
      discountPercentage: discountPercentage,
      stock: stock,
      stockQty: stock,
      stockStatus: stockStatus,
      status: status,
      featured: parseBoolean(row[COL.FEATURED - 1]),
      newArrival: parseBoolean(row[COL.NEW_ARRIVAL - 1]),
      trending: parseBoolean(row[COL.TRENDING - 1]),
      bestseller: parseBoolean(row[COL.FEATURED - 1]),
      publishDate: row[COL.PUBLISH_DATE - 1] ? formatDate(row[COL.PUBLISH_DATE - 1]) : undefined,
      mainImage: mainImage,
      galleryImages: images,
      images: images,
      sizeType: String(row[COL.SIZE_TYPE - 1] || 'Standard Saree (5.5m)').trim(),
      blouseSize: blouseSize,
      sizeChart: String(row[COL.SIZE_CHART - 1] || 'Saree Length: 5.5 meters | Blouse Piece: 0.8 meters').trim(),
      shippingInfo: String(row[COL.SHIPPING_INFO - 1] || 'Complimentary insured shipping across India. Dispatched within 24-48 hours.').trim(),
      returnInfo: String(row[COL.RETURN_INFO - 1] || '7-Day HASSLE-FREE exchange & return policy.').trim(),
      rating: rating,
      reviewCount: reviewCount,
      currency: 'INR',
      published: true,
      tags: [String(row[COL.FABRIC - 1] || 'Silk'), String(row[COL.CATEGORY - 1] || 'Saree')].concat(occasion)
    };

    return dto;
  } catch (err) {
    Logger.log('Error parsing row: ' + err.toString());
    return null;
  }
}

/**
 * Converts a raw row into InternalProduct DTO (FOR ADMIN USE ONLY)
 */
function parseAdminProductRow(row) {
  var publicDto = parsePublicProductRow(row);
  if (!publicDto) return null;

  var sourceCostRaw = row[COL.SOURCE_COST - 1];
  var sourceCost = (sourceCostRaw !== '' && !isNaN(parseFloat(sourceCostRaw))) ? parseFloat(sourceCostRaw) : undefined;

  publicDto.meeshoReferenceLink = String(row[COL.MEESHO_REFERENCE_LINK - 1] || '').trim() || undefined;
  publicDto.sourceCost = sourceCost;
  publicDto.sourceStatus = String(row[COL.SOURCE_STATUS - 1] || '').trim() || undefined;
  publicDto.supplierReference = String(row[COL.SUPPLIER_REFERENCE - 1] || '').trim() || undefined;
  publicDto.lastSourceCheck = row[COL.LAST_SOURCE_CHECK - 1] ? formatDate(row[COL.LAST_SOURCE_CHECK - 1]) : undefined;

  return publicDto;
}

/**
 * Internal Health Auditor Endpoint
 */
function generateCatalogueHealthReport() {
  var sheet = getProductsSheet();
  if (!sheet) return { error: 'Products sheet not found' };

  var data = sheet.getDataRange().getValues();
  var report = {
    totalRows: data.length - 1,
    validCount: 0,
    activeCount: 0,
    draftCount: 0,
    outOfStockCount: 0,
    hiddenCount: 0,
    discontinuedCount: 0,
    issues: [],
    healthScore: 100
  };

  var seenIds = {};

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var productId = String(row[COL.PRODUCT_ID - 1] || '').trim();
    var productName = String(row[COL.PRODUCT_NAME - 1] || '').trim() || 'Row ' + (i + 1);
    var category = String(row[COL.CATEGORY - 1] || '').trim();
    var priceRaw = row[COL.PRICE - 1];
    var status = String(row[COL.STATUS - 1] || '').trim();
    var mainImage = String(row[COL.MAIN_IMAGE_URL - 1] || '').trim();
    var stock = parseInt(row[COL.STOCK - 1], 10);

    if (status === 'Active') report.activeCount++;
    else if (status === 'Draft') report.draftCount++;
    else if (status === 'Out of Stock') report.outOfStockCount++;
    else if (status === 'Hidden') report.hiddenCount++;
    else if (status === 'Discontinued') report.discontinuedCount++;

    if (!productId) {
      report.issues.push({ productId: productId, productName: productName, issueType: 'INVALID_PRODUCT_ID', message: 'Missing Product ID at row ' + (i + 1), severity: 'ERROR' });
    } else if (seenIds[productId]) {
      report.issues.push({ productId: productId, productName: productName, issueType: 'INVALID_PRODUCT_ID', message: 'Duplicate Product ID "' + productId + '" at row ' + (i + 1), severity: 'ERROR' });
    } else {
      seenIds[productId] = true;
    }

    if (!mainImage) {
      report.issues.push({ productId: productId, productName: productName, issueType: 'MISSING_IMAGE', message: 'Main Image URL missing', severity: 'ERROR' });
    }

    if (priceRaw === '' || isNaN(parseFloat(priceRaw))) {
      report.issues.push({ productId: productId, productName: productName, issueType: 'MISSING_PRICE', message: 'Price is missing or invalid', severity: 'ERROR' });
    }

    if (!category) {
      report.issues.push({ productId: productId, productName: productName, issueType: 'MISSING_CATEGORY', message: 'Category is missing', severity: 'ERROR' });
    }

    if (isNaN(stock) || stock <= 3) {
      report.issues.push({ productId: productId, productName: productName, issueType: 'LOW_STOCK', message: 'Low inventory warning (Stock <= 3)', severity: 'WARNING' });
    }

    var validStatuses = ['Draft', 'Active', 'Out of Stock', 'Hidden', 'Discontinued'];
    if (validStatuses.indexOf(status) === -1) {
      report.issues.push({ productId: productId, productName: productName, issueType: 'INVALID_STATUS', message: 'Invalid status value "' + status + '"', severity: 'ERROR' });
    }
  }

  var totalErrors = report.issues.length;
  report.validCount = Math.max(0, report.totalRows - totalErrors);
  report.healthScore = report.totalRows > 0 ? Math.max(0, Math.round(((report.totalRows - totalErrors) / report.totalRows) * 100)) : 100;

  return report;
}

/**
 * Dynamic Categories endpoint
 */
function getDynamicCategoriesResponse() {
  var publicResult = getPublicProducts();
  var products = publicResult.products || [];
  var counts = {};

  products.forEach(function(p) {
    if (p.category) {
      counts[p.category] = (counts[p.category] || 0) + 1;
    }
  });

  var categories = Object.keys(counts).map(function(catName) {
    return { name: catName, count: counts[catName], slug: slugify(catName) };
  });

  return { success: true, data: categories };
}

/**
 * Dynamic Collections endpoint
 */
function getDynamicCollectionsResponse() {
  var publicResult = getPublicProducts();
  var products = publicResult.products || [];
  var collectionsSet = {};

  products.forEach(function(p) {
    if (p.collection) {
      if (Array.isArray(p.collection)) {
        p.collection.forEach(function(c) { collectionsSet[c] = true; });
      } else {
        collectionsSet[p.collection] = true;
      }
    }
  });

  var collections = Object.keys(collectionsSet).map(function(colName) {
    return { name: colName, slug: slugify(colName) };
  });

  return { success: true, data: collections };
}

// Helpers

function getProductsSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) return null;
  return ss.getSheetByName('PRODUCTS') || ss.getSheets()[0];
}

function parseMultiValue(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  var str = String(val).trim();
  if (!str) return [];
  var items = str.split(/[,\n|]/).map(function(item) {
    return item.trim();
  }).filter(function(item) {
    return item.length > 0;
  });

  var uniqueItems = [];
  var seen = {};
  for (var i = 0; i < items.length; i++) {
    var lower = items[i].toLowerCase();
    if (!seen[lower]) {
      seen[lower] = true;
      uniqueItems.push(items[i]);
    }
  }
  return uniqueItems;
}

function parseBoolean(val) {
  if (val === true || val === 1) return true;
  var str = String(val).toLowerCase().trim();
  return str === 'true' || str === 'yes' || str === '1';
}

function formatDate(dateVal) {
  if (!dateVal) return '';
  if (dateVal instanceof Date) {
    return dateVal.toISOString().split('T')[0];
  }
  return String(dateVal);
}

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}
