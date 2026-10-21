import { Anton } from "next/font/google";

// Shared instance so the navbar and the intro curtain do not each pull in
// their own @font-face for the same family.
export const wordmark = Anton({ weight: "400", subsets: ["latin"] });
