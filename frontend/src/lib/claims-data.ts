import { getClaimIds, getClaimReview } from "./api";
import { adaptClaimReview, type AdaptedClaim } from "./claim-adapter";

export type ClaimsSnapshot = {
  claimIds: string[];
  claims: AdaptedClaim[];
};

export async function loadClaimsSnapshot(): Promise<ClaimsSnapshot> {
  const { claims: claimIds } = await getClaimIds();
  const reviews = await Promise.all(
    claimIds.map(async (claimId) => adaptClaimReview(await getClaimReview(claimId))),
  );
  return { claimIds, claims: reviews };
}