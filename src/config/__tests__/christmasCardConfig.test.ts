import { describe, expect, it } from "vitest";
import { christmasCardConfig } from "../christmasCardConfig";

describe("christmasCardConfig", () => {
  it("provides required personalization defaults", () => {
    expect(christmasCardConfig.recipientName).toBe("[Tên người yêu]");
    expect(christmasCardConfig.senderName).toBe("[Tên của bạn]");
    expect(christmasCardConfig.coverTitle.trim().length).toBeGreaterThan(0);
  });

  it("provides 3 chibi quotes, 3-4 letter pages, 5 shooting star wishes, and 3 gift tickets", () => {
    expect(christmasCardConfig.chibiQuotes).toHaveLength(3);
    for (const quote of christmasCardConfig.chibiQuotes) {
      expect(quote.trim().length).toBeGreaterThan(0);
    }

    expect(christmasCardConfig.letterPages.length).toBeGreaterThanOrEqual(3);
    expect(christmasCardConfig.letterPages.length).toBeLessThanOrEqual(4);
    for (const page of christmasCardConfig.letterPages) {
      expect(page.trim().length).toBeGreaterThan(0);
    }

    expect(christmasCardConfig.shootingStarWishes).toHaveLength(5);
    for (const wish of christmasCardConfig.shootingStarWishes) {
      expect(wish.trim().length).toBeGreaterThan(0);
    }

    expect(christmasCardConfig.giftTickets).toHaveLength(3);
    const ticketIds = new Set<string>();
    for (const ticket of christmasCardConfig.giftTickets) {
      expect(ticket.id.trim().length).toBeGreaterThan(0);
      expect(ticket.badge.trim().length).toBeGreaterThan(0);
      expect(ticket.title.trim().length).toBeGreaterThan(0);
      expect(ticket.subtitle.trim().length).toBeGreaterThan(0);
      expect(ticket.accentColor.trim().length).toBeGreaterThan(0);
      expect(["food", "hug", "wish"]).toContain(ticket.icon);
      ticketIds.add(ticket.id);
    }
    expect(ticketIds.size).toBe(3);
  });
});
