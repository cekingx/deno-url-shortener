export class Link {
  constructor(
    public readonly id: number,
    public readonly shortCode: string,
    public readonly destinationUrl: string,
    public readonly customAlias: string | null,
    public readonly expiresAt: string | null,
    public readonly createdAt: string,
    public readonly clickCount: number,
  ) {}

  isExpired(): boolean {
    if (!this.expiresAt) return false;
    return new Date(this.expiresAt) < new Date();
  }
}
