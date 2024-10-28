import { AutoListing } from "@/app/[locale]/token-listing/add/hooks/useAutoListing";
import { TokenList } from "@/db/db";
import { Currency } from "@/sdk_hybrid/entities/currency";
import { Token } from "@/sdk_hybrid/entities/token";

export function filterTokens<T extends Currency>(searchStr: string, tokens: T[]): T[] {
  return tokens.filter((token) => {
    const nameParts = token.name ? token.name.split(" ") : [];
    const symbolParts = token.symbol ? token.symbol.split(" ") : [];
    const addressParts = token.isToken ? [token.address0, token.address1] : [];

    const allParts = [...nameParts, ...symbolParts, ...addressParts];
    if (token.name && nameParts.length > 1) {
      allParts.push(token.name);
    }

    if (token.symbol && symbolParts.length > 1) {
      allParts.push(token.symbol);
    }

    console.log(allParts);
    for (let i = 0; i < allParts.length; i++) {
      if (allParts[i].toLowerCase().startsWith(searchStr.toLowerCase())) {
        return true;
      }
    }
  });
}

export function filterTokenLists(searchStr: string, lists: TokenList[]): TokenList[] {
  return lists.filter(({ list, id }) => {
    const nameParts = list.name.split(" ");
    const idParts = id ? [id.toString()] : [];

    const allParts = [...nameParts, ...idParts];
    if (list.name && nameParts.length > 1) {
      allParts.push(list.name);
    }

    for (let i = 0; i < allParts.length; i++) {
      if (allParts[i].toLowerCase().startsWith(searchStr.toLowerCase())) {
        return true;
      }
    }
  });
}

export function filterAutoListings(searchStr: string, lists: AutoListing[]) {
  return lists.filter((list) => {
    const nameParts = list.name.split(" ");
    const idParts = list.id ? [list.id.toString()] : [];

    const allParts = [...nameParts, ...idParts];
    if (list.name && nameParts.length > 1) {
      allParts.push(list.name);
    }

    for (let i = 0; i < allParts.length; i++) {
      if (allParts[i].toLowerCase().startsWith(searchStr.toLowerCase())) {
        return true;
      }
    }
  });
}
