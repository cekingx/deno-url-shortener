import type { LinkRepository } from "../repositories/link.repository.ts";
import type { Link } from "../domain/link.ts";
import { generateShortCode } from "../utils/codegen.ts";

export class LinkService {
  constructor(private repo: LinkRepository) {}

  create(
    destination: string,
    alias?: string,
    expiresAt?: string,
  ): Link | Error {
    if (!isValidUrl(destination)) return new Error("invalid_url");

    const trimmedAlias = alias?.trim() || undefined;
    if (trimmedAlias && !isValidAlias(trimmedAlias)) {
      return new Error("invalid_alias");
    }

    const shortCode = trimmedAlias || generateShortCode();

    if (trimmedAlias) {
      const existing = this.repo.findByShortCode(shortCode);
      if (existing) return new Error("duplicate_alias");
    }

    try {
      return this.repo.create({
        shortCode,
        destinationUrl: destination,
        customAlias: trimmedAlias || null,
        expiresAt: expiresAt?.trim() || null,
      });
    } catch {
      return new Error("duplicate_alias");
    }
  }

  findAll(): Link[] {
    return this.repo.findAll();
  }
}

function isValidAlias(value: string): boolean {
  return /^[a-zA-Z0-9_-]+$/.test(value);
}

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
