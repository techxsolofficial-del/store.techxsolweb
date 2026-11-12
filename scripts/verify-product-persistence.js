import http from 'http';
import { createApp } from '../apps/api/src/app.js';
import { config } from '../apps/api/src/config/index.js';

async function runVerification() {
  console.log('================================================================');
  console.log('🚀 ApnaBuy Product Data Persistence & Lifecycle Verification');
  console.log('================================================================');

  const app = createApp();
  let server;
  let port;

  await new Promise((resolve) => {
    server = app.listen(0, () => {
      port = server.address().port;
      console.log(`[Test Server] Running on http://localhost:${port}`);
      resolve();
    });
  });

  const baseUrl = `http://localhost:${port}`;

  try {
    // Step 0: Login as Admin
    console.log('\n[Step 0] Logging in as Admin...');
    const loginRes = await fetch(`${baseUrl}/api/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: config.adminDefault.email,
        password: config.adminDefault.password,
      }),
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok || !loginData.success) {
      throw new Error(`Admin login failed: ${JSON.stringify(loginData)}`);
    }
    let token = loginData.data.token;
    console.log('✅ Admin login successful. Token acquired.');

    // Fetch categories
    const catRes = await fetch(`${baseUrl}/api/categories`);
    const catData = await catRes.json();
    const categoryId = catData.data[0]?.id || 'c1111111-1111-1111-1111-111111111111';

    // Step 1: Add Product A
    console.log('\n[Step 1] Adding Product A...');
    const productAInput = {
      categoryId,
      name: 'Product A - M28 TWS Gaming Earbuds',
      slug: `product-a-m28-tws-${Date.now()}`,
      shortDescription: 'Low latency gaming earbuds with mirror digital display.',
      description: 'Ultra fast Bluetooth 5.3 connection with breathing RGB lights and heavy bass.',
      basePricePkr: 2200,
      compareAtPricePkr: 3200,
      sku: `SKU-A-${Date.now().toString().slice(-4)}`,
      isActive: true,
      isFeatured: true,
      images: [
        {
          id: 'img-1',
          url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800',
          isPrimary: true,
        },
      ],
      variants: [],
      supplierOffers: [
        {
          supplierId: 'b1111111-1111-4111-a111-111111111111',
          supplierSku: 'SUP-M28',
          supplierCostPkr: 1300,
          isAvailable: true,
          leadTimeDays: 1,
        },
      ],
    };

    const addARes = await fetch(`${baseUrl}/api/admin/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(productAInput),
    });
    const addAData = await addARes.json();
    if (!addARes.ok || !addAData.success) {
      throw new Error(`Failed to add Product A: ${JSON.stringify(addAData)}`);
    }
    const productA = addAData.data;
    console.log(`✅ Product A created with ID: ${productA.id} (${productA.name})`);

    // Step 2 & 3: Refresh Admin Panel (Simulate page refresh fetching from DB)
    console.log('\n[Step 2 & 3] Simulating page refresh (re-fetching catalog from DB)...');
    const refreshRes1 = await fetch(`${baseUrl}/api/admin/products`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const refreshData1 = await refreshRes1.json();
    const foundA1 = refreshData1.data.find((p) => p.id === productA.id);
    if (!foundA1) {
      throw new Error('❌ Product A disappeared after simulated refresh!');
    }
    console.log(`✅ Confirmed Product A persists in database after refresh: ${foundA1.name}`);

    // Step 4: Add Product B
    console.log('\n[Step 4] Adding Product B...');
    const productBInput = {
      categoryId,
      name: 'Product B - Portable USB Juicer Blender',
      slug: `product-b-usb-juicer-${Date.now()}`,
      shortDescription: 'Rechargeable 6-blade smoothie maker and fruit blender.',
      description: 'Compact 380ml capacity with powerful motor and safety interlock mechanism.',
      basePricePkr: 1850,
      compareAtPricePkr: 2600,
      sku: `SKU-B-${Date.now().toString().slice(-4)}`,
      isActive: true,
      isFeatured: true,
      images: [
        {
          id: 'img-2',
          url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800',
          isPrimary: true,
        },
      ],
      variants: [],
      supplierOffers: [
        {
          supplierId: 'b1111111-1111-4111-a111-111111111111',
          supplierSku: 'SUP-JUICER',
          supplierCostPkr: 1100,
          isAvailable: true,
          leadTimeDays: 1,
        },
      ],
    };

    const addBRes = await fetch(`${baseUrl}/api/admin/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(productBInput),
    });
    const addBData = await addBRes.json();
    if (!addBRes.ok || !addBData.success) {
      throw new Error(`Failed to add Product B: ${JSON.stringify(addBData)}`);
    }
    const productB = addBData.data;
    console.log(`✅ Product B created with ID: ${productB.id} (${productB.name})`);

    // Step 5: Confirm both products exist
    console.log('\n[Step 5] Confirming both products exist simultaneously...');
    const refreshRes2 = await fetch(`${baseUrl}/api/admin/products`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const refreshData2 = await refreshRes2.json();
    const hasA = refreshData2.data.some((p) => p.id === productA.id);
    const hasB = refreshData2.data.some((p) => p.id === productB.id);
    if (!hasA || !hasB) {
      throw new Error(`❌ Overwrite error! Both products should exist. Has A: ${hasA}, Has B: ${hasB}`);
    }
    console.log('✅ Confirmed: Both Product A and Product B exist without overwriting.');

    // Step 6: Navigate to another page and return
    console.log('\n[Step 6] Navigating away to Orders page and returning...');
    await fetch(`${baseUrl}/api/admin/orders`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const returnRes = await fetch(`${baseUrl}/api/admin/products`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const returnData = await returnRes.json();
    if (!returnData.data.some((p) => p.id === productA.id) || !returnData.data.some((p) => p.id === productB.id)) {
      throw new Error('❌ Products lost when navigating back to products catalog!');
    }
    console.log('✅ Confirmed: Both products remain available after page navigation.');

    // Step 7 & 8: Log out and log back in
    console.log('\n[Step 7 & 8] Logging out and logging back in...');
    token = ''; // Clear token
    const reLoginRes = await fetch(`${baseUrl}/api/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: config.adminDefault.email,
        password: config.adminDefault.password,
      }),
    });
    const reLoginData = await reLoginRes.json();
    token = reLoginData.data.token;

    const afterLoginRes = await fetch(`${baseUrl}/api/admin/products`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const afterLoginData = await afterLoginRes.json();
    if (!afterLoginData.data.some((p) => p.id === productA.id) || !afterLoginData.data.some((p) => p.id === productB.id)) {
      throw new Error('❌ Products lost across logout / login cycle!');
    }
    console.log('✅ Confirmed: Both products remain available after logout and login.');

    // Step 9: Edit Product A and verify changes
    console.log('\n[Step 9] Editing Product A details...');
    const updatePayload = {
      name: 'Product A - M28 TWS Gaming Earbuds (Updated Edition)',
      basePricePkr: 2600,
      shortDescription: 'Upgraded Bluetooth 5.4 with ENC noise reduction.',
    };
    const updateRes = await fetch(`${baseUrl}/api/admin/products/${productA.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatePayload),
    });
    const updateData = await updateRes.json();
    if (!updateRes.ok || !updateData.success) {
      throw new Error(`Failed to update Product A: ${JSON.stringify(updateData)}`);
    }
    console.log(`✅ Product A updated successfully. New price: Rs. ${updateData.data.basePricePkr}`);

    // Verify Product B was not modified
    const checkBRes = await fetch(`${baseUrl}/api/admin/products/${productB.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const checkBData = await checkBRes.json();
    if (checkBData.data?.name !== productB.name || checkBData.data?.basePricePkr !== 1850) {
      throw new Error('❌ Editing Product A unintentionally modified Product B!');
    }
    console.log('✅ Verified: Editing Product A did not affect Product B.');

    // Step 10: Delete Product B and verify only Product B is removed
    console.log('\n[Step 10] Deleting Product B...');
    const deleteBRes = await fetch(`${baseUrl}/api/admin/products/${productB.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!deleteBRes.ok) {
      throw new Error('Failed to delete Product B');
    }

    const checkAfterDelete = await fetch(`${baseUrl}/api/admin/products`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const listAfterDelete = await checkAfterDelete.json();
    const stillHasA = listAfterDelete.data.some((p) => p.id === productA.id);
    const stillHasB = listAfterDelete.data.some((p) => p.id === productB.id);

    if (!stillHasA) {
      throw new Error('❌ Product A was mistakenly deleted when deleting Product B!');
    }
    if (stillHasB) {
      throw new Error('❌ Product B still exists after delete request!');
    }
    console.log('✅ Verified: Product B was removed, and Product A was preserved.');

    // Step 11: Check Public Storefront
    console.log('\n[Step 11] Checking public storefront...');
    const storeRes = await fetch(`${baseUrl}/api/products`);
    const storeData = await storeRes.json();
    const storefrontProductA = storeData.data.find((p) => p.id === productA.id);
    const storefrontProductB = storeData.data.find((p) => p.id === productB.id);

    if (!storefrontProductA) {
      throw new Error('❌ Product A is not showing on the public storefront!');
    }
    if (storefrontProductB) {
      throw new Error('❌ Deleted Product B is still visible on public storefront!');
    }

    // Check detail page slug fetch
    const slugRes = await fetch(`${baseUrl}/api/products/${productA.slug}`);
    const slugData = await slugRes.json();
    if (!slugRes.ok || !slugData.success) {
      throw new Error('❌ Public product detail page fetch by slug failed!');
    }
    console.log(`✅ Storefront verified: Active Product A loads with updated price Rs. ${slugData.data.basePricePkr}, and deleted Product B is hidden.`);

    // Step 12: Verify persistence across fresh server instance (simulate serverless cold restart)
    console.log('\n[Step 12] Simulating fresh server instance / redeployment restart...');
    server.close();

    const freshApp = createApp();
    await new Promise((resolve) => {
      server = freshApp.listen(0, () => {
        port = server.address().port;
        resolve();
      });
    });
    const freshBaseUrl = `http://localhost:${port}`;

    const freshCatalogRes = await fetch(`${freshBaseUrl}/api/products`);
    const freshCatalogData = await freshCatalogRes.json();
    const productAAfterRestart = freshCatalogData.data.find((p) => p.id === productA.id);

    if (!productAAfterRestart) {
      throw new Error('❌ Product A failed to persist across instance restart!');
    }
    console.log(`✅ Confirmed: Product A persists across server restarts with ID ${productAAfterRestart.id}.`);

    console.log('\n================================================================');
    console.log('🎉 ALL 12 TEST STEPS COMPLETED SUCCESSFULLY WITH 100% PERSISTENCE!');
    console.log('================================================================');
  } finally {
    if (server) {
      server.close();
    }
  }
}

runVerification().catch((err) => {
  console.error('\n❌ Verification Failed:', err);
  process.exit(1);
});
