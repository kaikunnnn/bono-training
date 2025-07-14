#!/usr/bin/env node
/**
 * Edge Functions テストスクリプト
 * Phase 1のテストのために作成
 */

const API_BASE_URL = 'https://fryogvfhymnpiqwssmuu.supabase.co/functions/v1';

// テスト用の認証トークンを設定してください
const TEST_AUTH_TOKEN = process.env.TEST_AUTH_TOKEN || 'YOUR_TEST_TOKEN_HERE';

/**
 * HTTP リクエストヘルパー
 */
async function makeRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const defaultOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TEST_AUTH_TOKEN}`
    }
  };

  const requestOptions = { ...defaultOptions, ...options };

  console.log(`🔄 Testing: ${requestOptions.method} ${url}`);
  console.log(`   Headers: ${JSON.stringify(requestOptions.headers, null, 2)}`);

  try {
    const response = await fetch(url, requestOptions);
    const data = await response.json();
    
    console.log(`✅ Status: ${response.status}`);
    console.log(`📊 Response:`, JSON.stringify(data, null, 2));
    
    return { success: true, status: response.status, data };
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * check-subscription テスト
 */
async function testCheckSubscription() {
  console.log('\n🧪 Testing check-subscription function...');
  
  // 認証ありのテスト
  const authResult = await makeRequest('/check-subscription', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TEST_AUTH_TOKEN}`
    }
  });
  
  if (authResult.success) {
    console.log('✅ check-subscription (authenticated) - SUCCESS');
    
    // 期待される構造の確認
    const expectedFields = ['subscribed', 'planType', 'hasMemberAccess', 'hasLearningAccess'];
    const missingFields = expectedFields.filter(field => !(field in authResult.data));
    
    if (missingFields.length === 0) {
      console.log('✅ Response structure - OK');
    } else {
      console.log(`⚠️  Missing fields: ${missingFields.join(', ')}`);
    }
  } else {
    console.log('❌ check-subscription (authenticated) - FAILED');
  }
  
  // 認証なしのテスト
  const unauthResult = await makeRequest('/check-subscription', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  
  if (unauthResult.success) {
    console.log('✅ check-subscription (unauthenticated) - SUCCESS');
  } else {
    console.log('❌ check-subscription (unauthenticated) - FAILED');
  }
}

/**
 * get-training-detail テスト
 */
async function testGetTrainingDetail() {
  console.log('\n🧪 Testing get-training-detail function...');
  
  // プロファイルページのテスト
  const profileResult = await makeRequest('/get-training-detail', {
    method: 'POST',
    body: JSON.stringify({ slug: 'profile' })
  });
  
  if (profileResult.success) {
    console.log('✅ get-training-detail (profile) - SUCCESS');
    
    // 期待される構造の確認
    const expectedFields = ['success', 'data'];
    const missingFields = expectedFields.filter(field => !(field in profileResult.data));
    
    if (missingFields.length === 0) {
      console.log('✅ Response structure - OK');
    } else {
      console.log(`⚠️  Missing fields: ${missingFields.join(', ')}`);
    }
  } else {
    console.log('❌ get-training-detail (profile) - FAILED');
  }
  
  // 存在しないコンテンツのテスト
  const notFoundResult = await makeRequest('/get-training-detail', {
    method: 'POST',
    body: JSON.stringify({ slug: 'nonexistent' })
  });
  
  if (notFoundResult.success && notFoundResult.status === 404) {
    console.log('✅ get-training-detail (not found) - SUCCESS');
  } else {
    console.log('❌ get-training-detail (not found) - FAILED');
  }
}

/**
 * 環境のヘルスチェック
 */
async function healthCheck() {
  console.log('\n🏥 Environment Health Check...');
  
  console.log(`🌐 API Base URL: ${API_BASE_URL}`);
  console.log(`🔑 Auth Token: ${TEST_AUTH_TOKEN ? 'SET' : 'NOT SET'}`);
  
  if (TEST_AUTH_TOKEN === 'YOUR_TEST_TOKEN_HERE') {
    console.log('⚠️  Please set TEST_AUTH_TOKEN environment variable');
    console.log('   Example: export TEST_AUTH_TOKEN="your-actual-token"');
  }
  
  // 基本的な接続テスト
  try {
    const response = await fetch(`${API_BASE_URL}/check-subscription`, {
      method: 'OPTIONS'
    });
    
    if (response.ok) {
      console.log('✅ CORS preflight - OK');
    } else {
      console.log('❌ CORS preflight - FAILED');
    }
  } catch (error) {
    console.log(`❌ Connection - FAILED: ${error.message}`);
  }
}

/**
 * メインテスト実行
 */
async function runTests() {
  console.log('🚀 Phase 1 Edge Functions Test Suite');
  console.log('=====================================');
  
  await healthCheck();
  await testCheckSubscription();
  await testGetTrainingDetail();
  
  console.log('\n🎯 Test Suite Complete!');
  console.log('=====================================');
  
  if (TEST_AUTH_TOKEN === 'YOUR_TEST_TOKEN_HERE') {
    console.log('\n💡 Next Steps:');
    console.log('1. Set your TEST_AUTH_TOKEN environment variable');
    console.log('2. Run the tests again');
    console.log('3. Check the Supabase dashboard for Edge Function logs');
  }
}

// スクリプトの実行
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests, testCheckSubscription, testGetTrainingDetail };