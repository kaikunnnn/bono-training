#!/bin/bash

# Stripe Webhook Secretの設定スクリプト
# 使い方: Stripe Dashboardから取得したWebhook Secretを引数として渡す

echo "Stripe Webhook Secret設定スクリプト"
echo "======================================"
echo ""
echo "まず、Stripe Dashboardから Webhook Signing Secret を取得してください:"
echo "1. https://dashboard.stripe.com/test/webhooks を開く"
echo "2. https://fryogvfhymnpiqwssmuu.supabase.co/functions/v1/stripe-webhook をクリック"
echo "3. 'Signing secret' をコピー（whsec_ で始まる文字列）"
echo ""
read -p "Webhook Secret を入力してください (whsec_...): " WEBHOOK_SECRET

if [[ ! $WEBHOOK_SECRET =~ ^whsec_ ]]; then
  echo "エラー: Webhook Secretは 'whsec_' で始まる必要があります"
  exit 1
fi

echo ""
echo "Supabaseに環境変数を設定しています..."
npx supabase secrets set STRIPE_WEBHOOK_SECRET="$WEBHOOK_SECRET"

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ 設定完了!"
  echo ""
  echo "次のステップ:"
  echo "1. Edge Functionが新しい環境変数を読み込むまで少し待つ（1-2分）"
  echo "2. Stripeダッシュボードで Webhookイベントを再送信してテスト"
else
  echo ""
  echo "❌ エラーが発生しました"
  echo "手動で設定してください:"
  echo "Supabase Dashboard → Edge Functions → Secrets"
fi
