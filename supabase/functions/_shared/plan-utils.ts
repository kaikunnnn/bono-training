/**
 * Stripe Price ID から plan_type と duration を判定する関数
 *
 * 重要: Stripe の Price ID を使って判定することで、価格変更時にも安定した動作を保証します。
 * 価格（amount）ベースの判定は価格変更時に plan_type が変わってしまうため使用しません。
 */

export interface PlanInfo {
  planType: string;
  duration: number;
}

/**
 * Stripe Price ID から plan_type と duration を取得
 *
 * @param priceId - Stripe の Price ID (例: price_1OIiMRKUVUnt8GtyMGSJIH8H)
 * @returns PlanInfo オブジェクト { planType, duration }
 *
 * マッピング:
 * - price_1RStBiKUVUnt8GtynMfKweby → standard (1ヶ月)
 * - price_1RStCiKUVUnt8GtyKJiieo6d → standard (3ヶ月)
 * - price_1OIiMRKUVUnt8GtyMGSJIH8H → feedback (1ヶ月) [Growthプラン]
 * - price_1OIiMRKUVUnt8GtyttXJ71Hz → feedback (3ヶ月) [Growthプラン]
 *
 * デフォルト: standard (1ヶ月)
 */
export function getPlanInfo(priceId: string): PlanInfo {
  const planMap: Record<string, PlanInfo> = {
    price_1RStBiKUVUnt8GtynMfKweby: { planType: "standard", duration: 1 },
    price_1RStCiKUVUnt8GtyKJiieo6d: { planType: "standard", duration: 3 },
    price_1OIiMRKUVUnt8GtyMGSJIH8H: { planType: "feedback", duration: 1 },
    price_1OIiMRKUVUnt8GtyttXJ71Hz: { planType: "feedback", duration: 3 },
  };

  return planMap[priceId] || { planType: "standard", duration: 1 };
}

// ============================================================================
// S4: Stripe Price オブジェクトから (plan_type, duration) を導出する
//     旧サイト(Memberstack)由来の legacy price は price ID が不明なため、
//     price ID の対応表ではなく Price オブジェクトの実データから導出する。
//     「未知→standard/1 に握り潰す」ことは絶対にしない（曖昧なら null を返す）。
// ============================================================================

/** derivePlanFromPrice が受け取る Stripe Price の最小形（実SDKの Price と互換） */
export interface StripePriceLike {
  id?: string;
  unit_amount?: number | null;
  nickname?: string | null;
  recurring?: { interval?: string | null; interval_count?: number | null } | null;
  /** 文字列(未展開のproduct ID) または expand済みの Product オブジェクト */
  product?:
    | string
    | { name?: string | null; deleted?: boolean | null }
    | null;
}

/** plan_type を示唆するキーワード（product名 / nickname から拾う） */
const FEEDBACK_KEYWORDS = ["feedback", "フィードバック", "growth", "グロース"];
const STANDARD_KEYWORDS = ["standard", "スタンダード", "basic", "ベーシック"];

/**
 * Tier 3 用の unit_amount(円・JPYはゼロ小数通貨のためそのまま円額) 完全一致テーブル。
 * 現行4価格 + 確証のある legacy のみを列挙する。
 * ⚠️ 曖昧な金額（例: legacy 26,400円 = plan_type不明）は載せない。
 *    載せると誤ったプランを課金状態に書き込むため、null(fail loud)に倒す。
 */
const EXACT_AMOUNT_TABLE: Record<number, PlanInfo> = {
  6800: { planType: "standard", duration: 1 }, // 現行 standard 1ヶ月 6,800円
  17400: { planType: "standard", duration: 3 }, // 現行 standard 3ヶ月 合計17,400円
  15800: { planType: "feedback", duration: 1 }, // 現行 feedback 1ヶ月 15,800円
  41400: { planType: "feedback", duration: 3 }, // 現行 feedback 3ヶ月 合計41,400円
  11940: { planType: "standard", duration: 3 }, // legacy standard 3ヶ月 合計11,940円
};

/** recurring.interval_count から duration を導く（3ヶ月契約 → 3、その他 → 1） */
function durationFromRecurring(price: StripePriceLike): number {
  const count = price.recurring?.interval_count;
  return count === 3 ? 3 : 1;
}

/** product名 / nickname を結合した小文字テキストを返す（キーワード判定用） */
function planTextSignals(price: StripePriceLike): string {
  const parts: string[] = [];
  if (price.nickname) parts.push(price.nickname);
  if (price.product && typeof price.product === "object") {
    // deleted な product は name を持たないためスキップ
    if (!price.product.deleted && price.product.name) {
      parts.push(price.product.name);
    }
  }
  return parts.join(" ").toLowerCase();
}

/**
 * Stripe Price オブジェクトから plan_type / duration を導出する。
 *
 * 判定順（positive signal のみ。曖昧なら null）:
 *  - Tier 2: product名 / nickname のキーワード一致で plan_type を決め、
 *            duration は recurring.interval_count から決める。
 *  - Tier 3: unit_amount の完全一致テーブル（現行4価格 + 確証legacy）。
 *  - どれにも当たらなければ null（呼び出し側で fail loud）。
 *
 * ※ Tier 1（env-varのprice ID完全一致）は各呼び出し側が先に行う前提。
 *
 * @returns 導出できれば PlanInfo、判定不能なら null
 */
export function derivePlanFromPrice(price: StripePriceLike | null | undefined): PlanInfo | null {
  if (!price) return null;

  // Tier 2: 名称キーワード（product名 / nickname）
  const text = planTextSignals(price);
  if (text) {
    const isFeedback = FEEDBACK_KEYWORDS.some((k) => text.includes(k));
    const isStandard = STANDARD_KEYWORDS.some((k) => text.includes(k));
    // 両方 or 片方だけ確実にヒットした場合のみ採用（feedback優先で衝突回避）
    if (isFeedback && !isStandard) {
      return { planType: "feedback", duration: durationFromRecurring(price) };
    }
    if (isStandard && !isFeedback) {
      return { planType: "standard", duration: durationFromRecurring(price) };
    }
    // 両方ヒット/両方ハズレはキーワード判定を諦め Tier 3 へ落とす
  }

  // Tier 3: unit_amount 完全一致
  if (typeof price.unit_amount === "number" && price.unit_amount in EXACT_AMOUNT_TABLE) {
    return { ...EXACT_AMOUNT_TABLE[price.unit_amount] };
  }

  // 判定不能 → null（standard/1 に握り潰さない）
  return null;
}
