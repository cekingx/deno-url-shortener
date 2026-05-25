import type { AuthService } from "./services/auth.service.ts";
import type { LinkService } from "./services/link.service.ts";

export interface Variables {
  authService: AuthService;
  linkService: LinkService;
}
