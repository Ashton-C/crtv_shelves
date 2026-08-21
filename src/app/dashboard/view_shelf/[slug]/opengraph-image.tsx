import { ImageResponse } from "next/og";
import { getShelfBySlug } from "~/server/actions/shelves";

export const runtime = "edge";
export const alt = "crtv_shelves";
export const size = { width: 1200, height: 628 };
export const contentType = "image/png";

export default async function OgImage({
  params,
}: {
  params: { slug: string };
}) {
  const shelf = await getShelfBySlug(params.slug);

  // OG images are fetched unauthenticated by crawlers, so there is no viewer to
  // authorise. A private shelf therefore falls through to the generic branded
  // card rather than leaking its contents into a link preview.
  if (!shelf || shelf.isPrivate) {
    return new ImageResponse(
      (
        <div
          style={{
            width: 1200,
            height: 628,
            background: "#131313",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ color: "#7a7775", fontSize: 32 }}>crtv_shelves</span>
        </div>
      ),
      { width: 1200, height: 628 },
    );
  }

  const accentColor = "#FF5F00";
  const topItems = shelf.items.slice(0, 5);

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 628,
          background: "#131313",
          display: "flex",
          flexDirection: "column",
          padding: "56px 64px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Brand */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 40,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: 3,
            }}
          >
            {[6, 10, 14, 18].map((h, i) => (
              <div
                key={i}
                style={{
                  width: 8,
                  height: h,
                  borderRadius: 2,
                  background: accentColor,
                }}
              />
            ))}
          </div>
          <span
            style={{
              fontSize: 18,
              fontWeight: 900,
              color: "#f0eeec",
              fontStyle: "italic",
              letterSpacing: "-0.5px",
            }}
          >
            crtv_shelves
          </span>
        </div>

        {/* Category pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <div
            style={{
              background: `${accentColor}22`,
              border: `1px solid ${accentColor}55`,
              borderRadius: 8,
              padding: "4px 12px",
              fontSize: 13,
              fontWeight: 700,
              color: accentColor,
              letterSpacing: "0.5px",
              textTransform: "uppercase",
            }}
          >
            {shelf.category}
          </div>
        </div>

        {/* Shelf name */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 900,
            color: "#f0eeec",
            fontStyle: "italic",
            lineHeight: 1,
            letterSpacing: "-2px",
            marginBottom: 40,
          }}
        >
          {shelf.name}
        </div>

        {/* Items */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {topItems.map((item, i) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
              }}
            >
              <span
                style={{
                  fontSize: 20,
                  fontWeight: 900,
                  color: i === 0 ? accentColor : "#4a4847",
                  width: 28,
                  textAlign: "right",
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </span>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: `linear-gradient(135deg, ${item.colorFrom ?? "#1C1B1B"}, ${item.colorTo ?? "#131313"})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#fff",
                  flexShrink: 0,
                }}
              >
                {item.initials ?? item.name.slice(0, 2).toUpperCase()}
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#f0eeec",
                    lineHeight: 1.2,
                  }}
                >
                  {item.name}
                </span>
                {item.sub && (
                  <span
                    style={{ fontSize: 13, color: "#7a7775", marginTop: 2 }}
                  >
                    {item.sub}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    { width: 1200, height: 628 },
  );
}
