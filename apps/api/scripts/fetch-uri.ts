import { fetchMetadataFromSeeds } from '@metaplex-foundation/mpl-token-metadata';
import { publicKey } from '@metaplex-foundation/umi';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';

async function main() {
  const umi = createUmi('https://api.mainnet-beta.solana.com');
  const metadata = await fetchMetadataFromSeeds(umi, {
    mint: publicKey('idrxTdNftk6tYedPv2M7tCFHBVCpk5rkiNRd8yUArhr')
  });
  console.log("URI IS:", metadata.uri);
}

main().catch(console.error);
