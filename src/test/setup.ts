import { vi } from "vitest";

// Deterministic IDs in every test run
vi.mock("nanoid", () => ({
  nanoid: vi.fn(() => "test123"),
}));
