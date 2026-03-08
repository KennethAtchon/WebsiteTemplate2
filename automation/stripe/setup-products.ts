/**
 * Stripe Product Setup
 *
 * Creates (or finds existing) Stripe products and prices for all three
 * subscription tiers, then updates backend/src/constants/stripe.constants.ts
 * with the real IDs so the app is immediately in sync.
 *
 * Idempotent: products/prices that already exist (matched by metadata.firebaseRole
 * and price amount + interval) are reused rather than duplicated.
 *
 * Usage:
 *   bun stripe/setup-products.ts
 *
 * The Firebase Stripe Payments extension requires products to have
 *   metadata.firebaseRole = "basic" | "pro" | "enterprise"
 * so the extension can resolve subscription tier from Stripe data.
 */

import { loadEnv, requireEnv } from "../shared/env.ts";
import Stripe from "stripe";
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

loadEnv();

const STRIPE_API_VERSION = "2025-02-24.acacia" as const;

interface TierDef {
  key: "basic" | "pro" | "enterprise";
  productName: string;
  firebaseRole: string;
  monthly: { amountCents: number };
  annual: { amountCents: number };
}

const TIER_DEFS: TierDef[] = [
  {
    key: "basic",
    productName: "Tier 1",
    firebaseRole: "basic",
    monthly: { amountCents: 1000 }, // $10.00
    annual: { amountCents: 10000 }, // $100.00
  },
  {
    key: "pro",
    productName: "Tier 2",
    firebaseRole: "pro",
    monthly: { amountCents: 2500 }, // $25.00
    annual: { amountCents: 20000 }, // $200.00
  },
  {
    key: "enterprise",
    productName: "Tier 3",
    firebaseRole: "enterprise",
    monthly: { amountCents: 10000 }, // $100.00
    annual: { amountCents: 100000 }, // $1000.00
  },
];

async function findOrCreateProduct(
  stripe: Stripe,
  def: TierDef,
): Promise<Stripe.Product> {
  // List all active products, look for matching firebaseRole metadata
  let startingAfter: string | undefined;
  while (true) {
    const page = await stripe.products.list({
      active: true,
      limit: 100,
      ...(startingAfter ? { starting_after: startingAfter } : {}),
    });
    const match = page.data.find(
      (p) => p.metadata?.firebaseRole === def.firebaseRole,
    );
    if (match) {
      console.log(`  [existing] ${match.id}  "${match.name}"`);
      return match;
    }
    if (!page.has_more) break;
    startingAfter = page.data[page.data.length - 1].id;
  }

  // Not found — create it
  const product = await stripe.products.create({
    name: def.productName,
    metadata: {
      firebaseRole: def.firebaseRole,
      tier: def.key,
    },
  });
  console.log(`  [created]  ${product.id}  "${product.name}"`);
  return product;
}

async function findOrCreatePrice(
  stripe: Stripe,
  productId: string,
  interval: "month" | "year",
  amountCents: number,
): Promise<Stripe.Price> {
  const prices = await stripe.prices.list({
    product: productId,
    active: true,
    limit: 100,
  });
  const match = prices.data.find(
    (p) =>
      p.recurring?.interval === interval && p.unit_amount === amountCents,
  );
  if (match) {
    console.log(`    [existing] ${match.id}  ${interval}ly  $${amountCents / 100}`);
    return match;
  }

  const price = await stripe.prices.create({
    product: productId,
    unit_amount: amountCents,
    currency: "usd",
    recurring: { interval },
  });
  console.log(`    [created]  ${price.id}  ${interval}ly  $${amountCents / 100}`);
  return price;
}

function buildStripeMapTs(results: {
  key: string;
  productId: string;
  productName: string;
  dashboardLink: string;
  monthly: { priceId: string; amount: number };
  annual: { priceId: string; amount: number };
}[]): string {
  const [basic, pro, enterprise] = results;
  return `export const STRIPE_MAP: StripeMap = {
  tiers: {
    basic: {
      productId: "${basic.productId}",
      productName: "${basic.productName}",
      gamma_hyperlink: "${basic.dashboardLink}",
      prices: {
        monthly: {
          priceId: "${basic.monthly.priceId}",
          amount: ${basic.monthly.amount},
        },
        annual: {
          priceId: "${basic.annual.priceId}",
          amount: ${basic.annual.amount},
        },
      },
    },
    pro: {
      productId: "${pro.productId}",
      productName: "${pro.productName}",
      gamma_hyperlink: "${pro.dashboardLink}",
      prices: {
        monthly: {
          priceId: "${pro.monthly.priceId}",
          amount: ${pro.monthly.amount},
        },
        annual: {
          priceId: "${pro.annual.priceId}",
          amount: ${pro.annual.amount},
        },
      },
    },
    enterprise: {
      productId: "${enterprise.productId}",
      productName: "${enterprise.productName}",
      gamma_hyperlink: "${enterprise.dashboardLink}",
      prices: {
        monthly: {
          priceId: "${enterprise.monthly.priceId}",
          amount: ${enterprise.monthly.amount},
        },
        annual: {
          priceId: "${enterprise.annual.priceId}",
          amount: ${enterprise.annual.amount},
        },
      },
    },
  },
} as const;
`;
}

function updateStripeConstants(
  results: {
    key: string;
    productId: string;
    productName: string;
    dashboardLink: string;
    monthly: { priceId: string; amount: number };
    annual: { priceId: string; amount: number };
  }[],
  isTestMode: boolean,
): void {
  const filePath = resolve(
    import.meta.dir,
    "../../backend/src/constants/stripe.constants.ts",
  );
  const content = readFileSync(filePath, "utf-8");

  const marker = "export const STRIPE_MAP";
  const markerIndex = content.indexOf(marker);
  if (markerIndex === -1) {
    throw new Error(`Could not find "${marker}" in ${filePath}`);
  }

  const header = content.slice(0, markerIndex);
  const newMap = buildStripeMapTs(results);
  writeFileSync(filePath, header + newMap, "utf-8");

  console.log(`\nUpdated: backend/src/constants/stripe.constants.ts`);
  if (isTestMode) {
    console.log("Note: these are TEST mode IDs (sk_test_...)");
  }
}

async function main(): Promise<void> {
  const stripeKey = requireEnv("STRIPE_SECRET_KEY");
  const isTestMode = stripeKey.startsWith("sk_test_");
  const dashboardBase = isTestMode
    ? "https://dashboard.stripe.com/test/products"
    : "https://dashboard.stripe.com/products";

  const stripe = new Stripe(stripeKey, { apiVersion: STRIPE_API_VERSION });

  console.log(
    `Mode: ${isTestMode ? "TEST" : "LIVE"}\nSetting up Stripe products...\n`,
  );

  const results: {
    key: string;
    productId: string;
    productName: string;
    dashboardLink: string;
    monthly: { priceId: string; amount: number };
    annual: { priceId: string; amount: number };
  }[] = [];

  for (const def of TIER_DEFS) {
    console.log(`\n[${def.key}]`);
    const product = await findOrCreateProduct(stripe, def);
    const [monthlyPrice, annualPrice] = await Promise.all([
      findOrCreatePrice(stripe, product.id, "month", def.monthly.amountCents),
      findOrCreatePrice(stripe, product.id, "year", def.annual.amountCents),
    ]);

    results.push({
      key: def.key,
      productId: product.id,
      productName: def.productName,
      dashboardLink: `${dashboardBase}/${product.id}`,
      monthly: {
        priceId: monthlyPrice.id,
        amount: def.monthly.amountCents / 100,
      },
      annual: {
        priceId: annualPrice.id,
        amount: def.annual.amountCents / 100,
      },
    });
  }

  updateStripeConstants(results, isTestMode);
  console.log("\nDone! Run `bun lint` in backend/ to verify the file.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
