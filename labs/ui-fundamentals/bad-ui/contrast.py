# ダメUIで使う色ペアのコントラスト比を計算する（WCAG 2.x の式）
def lum(h):
    h=h.lstrip('#'); c=[int(h[i:i+2],16)/255 for i in (0,2,4)]
    c=[x/12.92 if x<=0.04045 else ((x+0.055)/1.055)**2.4 for x in c]
    return 0.2126*c[0]+0.7152*c[1]+0.0722*c[2]
def ratio(a,b):
    la,lb=sorted([lum(a),lum(b)],reverse=True); return (la+0.05)/(lb+0.05)
pairs={
 'SaaS 本文の薄いグレー #A3A3A3 / 白':('#A3A3A3','#FFFFFF'),
 'SaaS 入力欄の枠 #E8E8E8 / 白':('#E8E8E8','#FFFFFF'),
 'SaaS 入力欄の枠 #E8E8E8 / 薄青パネル #F4F8FF':('#E8E8E8','#F4F8FF'),
 'SaaS 黄バッジ 白文字 / #FFC400':('#FFFFFF','#FFC400'),
 'SaaS 緑バッジ 白文字 / #22C55E':('#FFFFFF','#22C55E'),
 'SaaS 橙ボタン 白文字 / #FF9500':('#FFFFFF','#FF9500'),
 'SaaS 赤バナー 白文字 / #FF3B30':('#FFFFFF','#FF3B30'),
 'SaaS 保存ボタン 文字 #A3A3A3 / #E5E5E5':('#A3A3A3','#E5E5E5'),
 'SaaS 主ボタン 白文字 / #2F6BFF':('#FFFFFF','#2F6BFF'),
 'SaaS 進行中バッジ 白文字 / #3B82F6':('#FFFFFF','#3B82F6'),
 'SaaS 差し戻しバッジ 白文字 / #FF3B30':('#FFFFFF','#FF3B30'),
 'SaaS 検索アイコン #D4D4D4 / 白':('#D4D4D4','#FFFFFF'),
 'スマホ 価格 #B5B5B5 / 白':('#B5B5B5','#FFFFFF'),
 'スマホ 主色 白文字 / #FF7A00':('#FFFFFF','#FF7A00'),
 'スマホ 黄ボタン 白文字 / #FFD60A':('#FFFFFF','#FFD60A'),
 'スマホ LINE緑 白文字 / #34C759':('#FFFFFF','#34C759'),
 'スマホ 入力欄の枠 #EEEEEE / 白':('#EEEEEE','#FFFFFF'),
 'スマホ 次へボタン 文字 #B5B5B5 / #EDEDED':('#B5B5B5','#EDEDED'),
 'スマホ 空き 緑 #34C759 / 満席 赤 #FF3B30（色の差）':('#34C759','#FF3B30'),
 'スマホ ヘッダー 白文字 / #FF9F43':('#FFFFFF','#FF9F43'),
 'SaaS控えめ 本文グレー #9CA3AF / 白':('#9CA3AF','#FFFFFF'),
 'SaaS控えめ 入力欄の枠 #E5E7EB / 白':('#E5E7EB','#FFFFFF'),
 'SaaS控えめ 検索アイコン #D1D5DB / 白':('#D1D5DB','#FFFFFF'),
 'SaaS控えめ レビュー待ち #EAB308 / #FEF9C3':('#EAB308','#FEF9C3'),
 'SaaS控えめ 完了 #22C55E / #DCFCE7':('#22C55E','#DCFCE7'),
 'SaaS控えめ 進行中 #3B82F6 / #DBEAFE':('#3B82F6','#DBEAFE'),
 'SaaS控えめ 差し戻し #EF4444 / #FEE2E2':('#EF4444','#FEE2E2'),
 'SaaS控えめ 保存ボタン #9CA3AF / #F3F4F6':('#9CA3AF','#F3F4F6'),
 'SaaS控えめ 主ボタン 白 / #3B82F6':('#FFFFFF','#3B82F6'),
 'SaaS控えめ お知らせ文字 #EF4444 / #FEF2F2':('#EF4444','#FEF2F2'),
 'margin風 サブ文字 #A1A1AA / カード #FAFAFA':('#A1A1AA','#FAFAFA'),
 'margin風 入力欄の枠 #EBEBEB / 白':('#EBEBEB','#FFFFFF'),
 'margin風 検索アイコン #CFCFD4 / 白':('#CFCFD4','#FFFFFF'),
 'margin風 保存ボタン #A1A1AA / #EBEBEB':('#A1A1AA','#EBEBEB'),
 'margin風 主ボタン 白 / #3B6CF6':('#FFFFFF','#3B6CF6'),
 'margin風 レビュー待ち #EAB308 / #FEF9C3':('#EAB308','#FEF9C3'),
 'margin風 完了 #22C55E / #DCFCE7':('#22C55E','#DCFCE7'),
 'margin風 進行中 #3B6CF6 / #E3EBFF':('#3B6CF6','#E3EBFF'),
 'margin風 差し戻し #EF4444 / #FEE2E2':('#EF4444','#FEE2E2'),
 'margin風 通知バッジ 白 / 橙 #F37509':('#FFFFFF','#F37509'),
 'margin風 選択中のタブ 青 #3B6CF6 / カード #FAFAFA':('#3B6CF6','#FAFAFA'),
 'margin風 選ばれていないタブ #A1A1AA / カード #FAFAFA':('#A1A1AA','#FAFAFA'),
 'margin風 バーの溝 白 / カード #FAFAFA（溝が見えない）':('#FFFFFF','#FAFAFA'),
 'margin風 お知らせの帯 #EF4444 / #FEF2F2':('#EF4444','#FEF2F2'),
}
for k,(a,b) in pairs.items(): print(f'{ratio(a,b):5.2f}:1  {k}')

# ===== アフター（margin風を直した版。色は GitHub Primer から借りる：台帳 CL-100）=====
# 段階は記事のまとまり順 A(f1 f2 f4) → B(f5 f6 f7 f18) → D(f11-f14) → C(f8 f9 f10)。地とカードは f5 で
# ほぼ無彩色のニュートラル（地 #eff2f5・カード #f6f8fa）になるので、段階1だけはダメUIの地 #EEF3FF・カード #FAFAFA の上で測る
after={
 'f1  新規タスク 白 / #1552E0':('#FFFFFF','#1552E0'),
 'f1  リンク #1552E0 / カード #FAFAFA（段階1）':('#1552E0','#FAFAFA'),
 'f1  リンク #1552E0 / カード #f6f8fa（段階2〜）':('#1552E0','#f6f8fa'),
 'f1  選択中のタブ #1f2328 / カード #FAFAFA（段階1）':('#1f2328','#FAFAFA'),
 'f1  選択中のタブ #1f2328 / カード #f6f8fa':('#1f2328','#f6f8fa'),
 'f1  進み具合のバー #1f2328 / 溝 #e6eaef':('#1f2328','#e6eaef'),
 'f1  プロジェクト印 ピンク #bf3989 / 地 #EEF3FF（段階1）':('#bf3989','#EEF3FF'),
 'f1  プロジェクト印 ピンク #bf3989 / 地 #eff2f5':('#bf3989','#eff2f5'),
 'f1  プロジェクト印 ピンク #bf3989 / 選択中ナビ #e6eaef':('#bf3989','#e6eaef'),
 'f2  選択中ナビ 文字 #1f2328 / #e6eaef':('#1f2328','#e6eaef'),
 'f2  選択中ナビ 左線 #1f2328 / 地 #EEF3FF（段階1）':('#1f2328','#EEF3FF'),
 'f2  選択中ナビ 左線 #1f2328 / 地 #eff2f5':('#1f2328','#eff2f5'),
 'f4  通知バッジ 白 / #cf222e（赤の例外：項目1）':('#FFFFFF','#cf222e'),
 'f5  アバター #59636e / #e6eaef':('#59636e','#e6eaef'),
 'f6  招待 #1f2328 / 白':('#1f2328','#FFFFFF'),
 'f6  白ボタンの枠 #d1d9e0 / 白（参考：文字で押せると分かるので枠は3:1不要）':('#d1d9e0','#FFFFFF'),
 'f7  タスクを削除 #d1242f / 白':('#d1242f','#FFFFFF'),
 'f7  削除する 白 / #cf222e':('#FFFFFF','#cf222e'),
 'f18 変更を保存 白 / #1552E0':('#FFFFFF','#1552E0'),
 'f18 キャンセル・複製 #1f2328 / 白':('#1f2328','#FFFFFF'),
 'f11 未着手 #59636e / #e6eaef':('#59636e','#e6eaef'),
 'f11 進行中 #0969da / #ddf4ff':('#0969da','#ddf4ff'),
 'f11 レビュー待ち #9a6700 / #fff8c5':('#9a6700','#fff8c5'),
 'f11 差し戻し #bc4c00 / #fff1e5':('#bc4c00','#fff1e5'),
 'f11 完了 #1a7f37 / #dafbe1':('#1a7f37','#dafbe1'),
 'f11 ▲1件 #1a7f37 / 白':('#1a7f37','#FFFFFF'),
 'f12 お知らせ 文字 #1f2328 / #fff8c5':('#1f2328','#fff8c5'),
 'f12 お知らせ アイコン #9a6700 / #fff8c5':('#9a6700','#fff8c5'),
 'f12 エラー #d1242f / #ffebe9':('#d1242f','#ffebe9'),
 'f12 期限切れの日付 #d1242f / カード #f6f8fa':('#d1242f','#f6f8fa'),
 'f12 期限切れの日付 #d1242f / 選択行 白':('#d1242f','#FFFFFF'),
 'f13 タグ・NEW #59636e / 白':('#59636e','#FFFFFF'),
 'f13 タグ・NEW #59636e / カード #f6f8fa':('#59636e','#f6f8fa'),
 'f13 プロジェクト印 青緑 #1b7c83 / 地 #eff2f5':('#1b7c83','#eff2f5'),
 'f13 プロジェクト印 オリーブ #7a6f1c / 地 #eff2f5':('#7a6f1c','#eff2f5'),
 'f14 必須・優先度の文字 #4C4C4C / カード #f6f8fa':('#4C4C4C','#f6f8fa'),
 'f14 優先度 高の棒 #bc4c00 / カード #f6f8fa':('#bc4c00','#f6f8fa'),
 'f14 優先度 中・低の棒 #59636e / カード #f6f8fa':('#59636e','#f6f8fa'),
 'f8  サブ文字・選ばれていないタブ #59636e / カード #f6f8fa':('#59636e','#f6f8fa'),
 'f8  サブ文字 #59636e / 地 #eff2f5':('#59636e','#eff2f5'),
 'f8  サブ文字 #59636e / 白':('#59636e','#FFFFFF'),
 'f9  入力欄の枠 #818b98 / 白':('#818b98','#FFFFFF'),
 'f9  検索アイコン #59636e / 白':('#59636e','#FFFFFF'),
 'f10 リンク（下線） #1552E0 / カード #f6f8fa':('#1552E0','#f6f8fa'),
}
print('\n--- アフター ---')
for k,(a,b) in after.items(): print(f'{ratio(a,b):5.2f}:1  {k}')

# 項目5：地の色み（CIELAB の彩度 C*）。ブランドの色みをごく少し混ぜたニュートラルはよい（Material 3 は neutral を彩度4で作る）
def chroma(h):
    h=h.lstrip('#'); c=[int(h[i:i+2],16)/255 for i in (0,2,4)]
    c=[x/12.92 if x<=0.04045 else ((x+0.055)/1.055)**2.4 for x in c]
    X=(0.4124*c[0]+0.3576*c[1]+0.1805*c[2])/0.95047; Y=0.2126*c[0]+0.7152*c[1]+0.0722*c[2]; Z=(0.0193*c[0]+0.1192*c[1]+0.9505*c[2])/1.08883
    f=lambda t:t**(1/3) if t>0.008856 else 7.787*t+16/116
    a=500*(f(X)-f(Y)); b=200*(f(Y)-f(Z)); return (a*a+b*b)**.5
print('\n--- 地の彩度（CIELAB C*）---')
for k,h in {'ダメUIの地':'#EEF3FF','Gmail の地':'#F8FAFD','Primer bgColor-muted（アフターのカード）':'#f6f8fa','アフターの地':'#eff2f5','選択中ナビ・バーの溝':'#e6eaef'}.items(): print(f'{chroma(h):4.1f}  {h}  {k}')
