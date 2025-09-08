#!/usr/bin/env node

/**
 * Test script to verify product image URLs are working correctly
 * This script tests the backend API to ensure image_url is returned properly
 */

const axios = require('axios');

const API_BASE_URL = process.env.API_URL || 'http://localhost:3000/api';

async function testProductImages() {
  console.log('🧪 Testing Product Image URLs...\n');

  try {
    // Test 1: Get all products
    console.log('1️⃣ Testing GET /api/products endpoint...');
    const productsResponse = await axios.get(`${API_BASE_URL}/products?limit=5`);
    
    if (productsResponse.data?.success) {
      const products = productsResponse.data.data || [];
      console.log(`✅ Found ${products.length} products`);
      
      products.forEach((product, index) => {
        console.log(`\n📦 Product ${index + 1}: ${product.name}`);
        console.log(`   ID: ${product.id}`);
        console.log(`   image_url: ${product.image_url || 'NOT SET'}`);
        console.log(`   imageUrl: ${product.imageUrl || 'NOT SET'}`);
        console.log(`   primaryImage: ${product.primaryImage || 'NOT SET'}`);
        console.log(`   image: ${product.image || 'NOT SET'}`);
        
        // Check if any image field has a value
        const hasImage = product.image_url || product.imageUrl || product.primaryImage || product.image;
        if (hasImage) {
          console.log(`   ✅ Has image: ${hasImage}`);
        } else {
          console.log(`   ❌ No image found`);
        }
      });
    } else {
      console.log('❌ Failed to fetch products:', productsResponse.data);
    }

    // Test 2: Get single product (if we have products)
    if (productsResponse.data?.success && productsResponse.data.data?.length > 0) {
      const firstProduct = productsResponse.data.data[0];
      console.log(`\n2️⃣ Testing GET /api/products/${firstProduct.id} endpoint...`);
      
      const singleProductResponse = await axios.get(`${API_BASE_URL}/products/${firstProduct.id}`);
      
      if (singleProductResponse.data?.success) {
        const product = singleProductResponse.data.data;
        console.log(`✅ Single product fetched: ${product.name}`);
        console.log(`   image_url: ${product.image_url || 'NOT SET'}`);
        console.log(`   imageUrl: ${product.imageUrl || 'NOT SET'}`);
        console.log(`   primaryImage: ${product.primaryImage || 'NOT SET'}`);
        console.log(`   image: ${product.image || 'NOT SET'}`);
        console.log(`   images array: ${product.images?.length || 0} images`);
        
        if (product.images?.length > 0) {
          console.log('   Additional images:');
          product.images.forEach((img, index) => {
            console.log(`     ${index + 1}. ${img}`);
          });
        }
      } else {
        console.log('❌ Failed to fetch single product:', singleProductResponse.data);
      }
    }

    // Test 3: Test image URL construction
    console.log('\n3️⃣ Testing image URL construction...');
    const testImageUrl = '/uploads/image-1757366082328-88335091.png';
    const apiBase = API_BASE_URL.replace('/api', '');
    const fullImageUrl = `${apiBase}${testImageUrl}`;
    console.log(`   Test image path: ${testImageUrl}`);
    console.log(`   API base: ${apiBase}`);
    console.log(`   Full URL: ${fullImageUrl}`);

    console.log('\n✅ Product image testing completed!');

  } catch (error) {
    console.error('❌ Error testing product images:', error.message);
    if (error.response) {
      console.error('   Response status:', error.response.status);
      console.error('   Response data:', error.response.data);
    }
  }
}

// Run the test
testProductImages();