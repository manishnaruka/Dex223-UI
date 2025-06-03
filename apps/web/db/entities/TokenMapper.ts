import { Address } from "viem";

import { db, Erc223Mapping } from "@/db/db";

export class TokenMapper {
  private tokenMap: Map<string, Address> = new Map();
  private initialized = false;

  public async init() {
    if (this.initialized) return;
    const allMappings = await db.erc223Mapping.toArray();
    this.tokenMap = new Map(allMappings.map((t) => [t.erc20.toLowerCase(), t.erc223]));
    this.initialized = true;
  }

  public getERC223(erc20: string): Address | undefined {
    return this.tokenMap.get(erc20.toLowerCase());
  }

  public getAll(): Map<string, Address> {
    return this.tokenMap;
  }
}

const MAPPING_ENDPOINT =
  "https://api.dex223.io/v1/cache/explores/d223/predict-converter?network=ethereum"; // заміни на реальний URL

export async function syncErc223MappingFromApi() {
  try {
    const response = await fetch(MAPPING_ENDPOINT);
    if (!response.ok) throw new Error("Failed to fetch token mapping");

    const data: { data: Record<Address, Address> } = await response.json();

    // Перетворити в масив об'єктів [{ erc20, erc223 }]
    const mappingArray: Erc223Mapping[] = Object.entries(data.data).map(([erc20, erc223]) => ({
      erc20: erc20.toLowerCase() as Address,
      erc223: erc223.toLowerCase() as Address,
    }));

    await db.erc223Mapping.clear();
    await db.erc223Mapping.bulkPut(mappingArray);

    console.log(`✅ Synced ${mappingArray.length} ERC223 mappings.`);
  } catch (error) {
    console.error("❌ Failed to sync ERC223 mapping:", error);
  }
}
