// Font required — add to your HTML <head> or global CSS:
// <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@400;600&display=swap" rel="stylesheet">

import { useEffect, useState } from "react";

/* ── Asset URLs ── */
const imgCloud    = "https://www.figma.com/api/mcp/asset/56d33082-44bb-45d6-8278-5cdee375d2ef";
const imgFlower   = "https://www.figma.com/api/mcp/asset/2c60fec1-f1a4-4780-bfce-d53ecff2e8fd";
const imgLandscape= "https://www.figma.com/api/mcp/asset/9a998740-e584-40cd-b021-0ac86746f9ae";
const imgSprite   = "https://www.figma.com/api/mcp/asset/865cf3f9-f948-4079-91b2-08daef3c6762";
const imgIconAdd  = "https://www.figma.com/api/mcp/asset/fd154ce1-0459-486c-83d2-76f488f944a2";
const imgIconInsight = "https://www.figma.com/api/mcp/asset/a8b3bee3-125e-418c-8a99-058edd0085ae";
const imgIconDonate = "https://www.figma.com/api/mcp/asset/c6825e8f-b6de-4bd7-ba2d-87c9df2ea92e";
// Mobile-only assets
const imgAvatar   = "https://www.figma.com/api/mcp/asset/882d3210-9618-401a-9361-598a2f08356a";
const imgBookmark = "https://www.figma.com/api/mcp/asset/3cf41b1d-73c4-413a-8af0-47a0882b5c5f";
const imgNext     = "https://www.figma.com/api/mcp/asset/efbad1b2-aba3-480b-911c-3f5892d3f021";

type Breakpoint = "mobile" | "tablet" | "desktop";

function useBreakpoint(): Breakpoint {
  const [bp, setBp] = useState<Breakpoint>("mobile");
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setBp(w >= 1200 ? "desktop" : w >= 768 ? "tablet" : "mobile");
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return bp;
}

/* ── Design tokens ── */
const cream100 = "#f8ebdb";
const cream200 = "#efcca4";
const yellow800 = "#ffc14c";
const textColor = "#1e1e1e";
const shadow40 = "0px 4px 40px 0px rgba(0,0,0,0.1)";
const shadowCard = "0px 4.669px 46.687px 0px rgba(0,0,0,0.1)";

/* ── Reusable sub-components ── */

function CloudSprite({ mirrored = false, style }: { mirrored?: boolean; style: React.CSSProperties }) {
  return (
    <div style={{ position: "absolute", overflow: "hidden", pointerEvents: "none", zIndex: 1, ...style }}
         style-transform={mirrored ? "scaleX(-1)" : undefined}>
      <div style={{ ...(mirrored ? { transform: "scaleX(-1)", width: "100%", height: "100%" } : {}) }}>
        <img
          alt=""
          src={imgCloud}
          style={{ position: "absolute", maxWidth: "none", width: "292.24%", height: "861.86%", left: "-172.98%", top: "-256.19%" }}
        />
      </div>
    </div>
  );
}

function IconButton({ src, alt }: { src: string; alt: string }) {
  return (
    <button
      style={{
        background: "white", borderRadius: 100, width: 40, height: 40,
        display: "flex", alignItems: "center", justifyContent: "center",
        overflow: "hidden", boxShadow: shadow40, border: "none", cursor: "pointer", flexShrink: 0,
      }}
    >
      <img alt={alt} src={src} style={{ width: 24, height: 24, objectFit: "contain", display: "block" }} />
    </button>
  );
}

function FeatureMenu({
  icon, iconAlt, lines, style, textSize, lineH,
}: {
  icon: string; iconAlt: string; lines: string[];
  style: React.CSSProperties; textSize: number; lineH: number;
}) {
  return (
    <div style={{ position: "absolute", display: "flex", gap: 8, alignItems: "flex-start", zIndex: 10, ...style }}>
      <div style={{
        background: "white", borderRadius: 100, width: 40, height: 40, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        overflow: "hidden", boxShadow: shadow40,
      }}>
        <img alt={iconAlt} src={icon} style={{ width: 24, height: 24, objectFit: "contain", display: "block" }} />
      </div>
      <div style={{ fontWeight: 600, color: textColor }}>
        {lines.map((line, i) => (
          <p key={i} style={{ textDecoration: "underline", margin: 0, fontSize: textSize, lineHeight: `${lineH}px` }}>
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}

function CardBack({
  style, innerInset, innerRadius,
}: {
  style: React.CSSProperties; innerInset: number; innerRadius: number;
}) {
  return (
    <div style={{
      position: "absolute", background: cream100, overflow: "hidden", zIndex: 8,
      boxShadow: shadowCard, ...style,
    }}>
      <div style={{
        position: "absolute", border: `2px solid ${cream200}`,
        inset: innerInset, borderRadius: innerRadius,
      }} />
    </div>
  );
}

/* ══════════════════════════════════════════
   MOBILE LAYOUT
   ══════════════════════════════════════════ */
function MobileLayout() {
  return (
    <div style={{
      position: "relative", width: "100%", minHeight: 924, overflow: "hidden",
      background: "linear-gradient(to bottom, #a9cae5, #e4e7e8)",
      fontFamily: "'IBM Plex Sans Thai', sans-serif",
    }}>
      {/* Cloud left */}
      <div style={{ position: "absolute", overflow: "hidden", pointerEvents: "none", zIndex: 1, left: -87, top: -4, width: 255, height: 154 }}>
        <img alt="" src={imgCloud} style={{ position: "absolute", maxWidth: "none", width: "292.24%", height: "861.86%", left: "-172.98%", top: "-256.19%" }} />
      </div>
      {/* Cloud right (mirrored) */}
      <div style={{ position: "absolute", overflow: "hidden", pointerEvents: "none", zIndex: 1, left: "calc(50% + 51.5px)", top: 60, width: 169, height: 102, transform: "scaleX(-1)" }}>
        <img alt="" src={imgCloud} style={{ position: "absolute", maxWidth: "none", width: "292.24%", height: "861.86%", left: "-172.98%", top: "-256.19%" }} />
      </div>

      {/* Header: greeting + avatar */}
      <div style={{ position: "absolute", left: 16, top: 78, width: 343, display: "flex", flexDirection: "column", gap: 32, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <p style={{ fontSize: 32, fontWeight: 600, lineHeight: "40px", color: textColor, margin: 0, width: 290 }}>
            ไง, สตางค์
          </p>
          <img alt="avatar" src={imgAvatar} style={{ width: 40, height: 40, borderRadius: 100, objectFit: "cover", flexShrink: 0 }} />
        </div>
        {/* Subtitle + icon buttons */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <p style={{ fontSize: 20, fontWeight: 600, lineHeight: "28px", color: textColor, margin: 0, width: 239 }}>
            วันนี้คุณไม่ต้องเก่งก็ได้นะ<br />แค่ยังอยู่ตรงนี้…ก็พอแล้ว
          </p>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <IconButton src={imgBookmark} alt="bookmark" />
            <IconButton src={imgNext} alt="next" />
          </div>
        </div>
      </div>

      {/* Card stack */}
      {/* Back-left */}
      <CardBack
        style={{ width: 216, height: 306, borderRadius: 16, left: 16, top: 264, transform: "rotate(-4deg)", boxShadow: shadow40 }}
        innerInset={8} innerRadius={8}
      />
      {/* Back-right */}
      <CardBack
        style={{ width: 216, height: 306, borderRadius: 16, left: "calc(25% + 49.25px)", top: 264, transform: "rotate(4deg)", boxShadow: shadow40 }}
        innerInset={8} innerRadius={8}
      />
      {/* Front card */}
      <div style={{
        position: "absolute", background: cream100, overflow: "hidden",
        left: "50%", transform: "translateX(-50%)", top: 250,
        width: 216, height: 335, borderRadius: 16, boxShadow: shadow40, zIndex: 9,
      }}>
        <div style={{ position: "absolute", border: `2px solid ${cream200}`, inset: 8, borderRadius: 8 }} />
        <div style={{ position: "absolute", display: "flex", flexDirection: "column", alignItems: "center", gap: 16, left: 46, top: 58.5, width: 125 }}>
          <img alt="flower" src={imgFlower} style={{ width: 115, height: 162, objectFit: "cover", display: "block" }} />
          <button style={{
            background: yellow800, borderRadius: 100, border: "none", cursor: "pointer",
            padding: "8px 16px", boxShadow: "0px 4.669px 23.343px rgba(0,0,0,0.15)", whiteSpace: "nowrap",
          }}>
            <span style={{ fontSize: 14, fontWeight: 600, lineHeight: "22px", color: textColor }}>คำถามประจำวัน</span>
          </button>
        </div>
      </div>

      {/* Feature menus */}
      <FeatureMenu icon={imgIconAdd} iconAlt="add" lines={["วันนี้เป็นไงบ้าง", "เล่าให้เราฟังได้นะ"]} style={{ left: 16, top: 622 }} textSize={14} lineH={22} />
      <FeatureMenu icon={imgIconInsight} iconAlt="insight" lines={["ช่วงนี้ฉันดู", "เป็นยังไงบ้าง?"]} style={{ left: "calc(50% + 20.5px)", top: 644 }} textSize={14} lineH={22} />

      {/* Donate button — half-visible at bottom edge on mobile */}
      <div style={{ position: "absolute", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", left: "50%", transform: "translateX(-50%)", top: 775 }}>
        <button style={{ background: "#7b8d5b", borderRadius: 8, padding: 16, display: "flex", alignItems: "center", gap: 8, cursor: "pointer", border: "none", width: 175 }}>
          <div style={{ width: 40, height: 40, background: "white", borderRadius: 100, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
            <img alt="donate" src={imgIconDonate} style={{ width: 24, height: 24, objectFit: "contain", display: "block" }} />
          </div>
          <div style={{ color: "white", fontWeight: 600 }}>
            <p style={{ margin: 0, textDecoration: "underline", fontSize: 14, lineHeight: "22px" }}>อยากให้กำลังใจ</p>
            <p style={{ margin: 0, textDecoration: "underline", fontSize: 14, lineHeight: "22px" }}>ทีมงานของเรา?</p>
          </div>
        </button>
        <div style={{ width: 0, height: 0, borderLeft: "9.5px solid transparent", borderRight: "9.5px solid transparent", borderTop: "11px solid #7b8d5b" }} />
      </div>

      {/* Landscape */}
      <div style={{ position: "absolute", overflow: "hidden", zIndex: 5, left: "calc(37.5% + 18.88px)", transform: "translateX(-50%)", top: 711, width: 551, height: 213 }}>
        <img alt="" src={imgLandscape} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }} />
      </div>

      {/* Blob */}
      <div style={{ position: "absolute", overflow: "hidden", pointerEvents: "none", zIndex: 6, left: 0, top: 672, width: 144, height: 120 }}>
        <img alt="" src={imgSprite} style={{ position: "absolute", maxWidth: "none", width: "303.37%", height: "643.22%", left: "-17.13%", top: "-35.01%" }} />
      </div>
      {/* Cactus */}
      <div style={{ position: "absolute", overflow: "hidden", pointerEvents: "none", zIndex: 6, left: "calc(75% + 6.75px)", top: 688, width: 80, height: 123 }}>
        <img alt="" src={imgSprite} style={{ position: "absolute", maxWidth: "none", width: "715.23%", height: "834.78%", left: "-439.07%", top: "-604.13%" }} />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   TABLET LAYOUT
   ══════════════════════════════════════════ */
function TabletLayout() {
  return (
    <div style={{
      position: "relative", width: "100%", minHeight: 1200, overflow: "hidden",
      background: "linear-gradient(to bottom, #abcbe6, #ebedef)",
      fontFamily: "'IBM Plex Sans Thai', sans-serif",
    }}>
      {/* Cloud left */}
      <div style={{ position: "absolute", overflow: "hidden", pointerEvents: "none", zIndex: 1, left: -66, top: 0, width: 432, height: 260 }}>
        <img alt="" src={imgCloud} style={{ position: "absolute", maxWidth: "none", width: "292.24%", height: "861.86%", left: "-172.98%", top: "-256.19%" }} />
      </div>
      {/* Cloud right */}
      <div style={{ position: "absolute", overflow: "hidden", pointerEvents: "none", zIndex: 1, left: "calc(66.67% + 4px)", top: 130, width: 296, height: 178, transform: "scaleX(-1)" }}>
        <img alt="" src={imgCloud} style={{ position: "absolute", maxWidth: "none", width: "292.24%", height: "861.86%", left: "-172.98%", top: "-256.19%" }} />
      </div>

      {/* Centered headline */}
      <p style={{
        position: "absolute", left: "50%", transform: "translateX(-50%)", top: 308,
        fontSize: 32, fontWeight: 600, lineHeight: "40px", color: textColor,
        textAlign: "center", margin: 0, whiteSpace: "nowrap", zIndex: 10,
      }}>
        วันนี้คุณไม่ต้องเก่งก็ได้นะ<br />&nbsp;แค่ยังอยู่ตรงนี้…ก็พอแล้ว
      </p>

      {/* Card stack */}
      <CardBack style={{ width: 252, height: 358, borderRadius: 18.675, left: "calc(16.67% + 82px)", top: 452, transform: "rotate(-4deg)" }} innerInset={9.33} innerRadius={9.337} />
      <CardBack style={{ width: 252, height: 358, borderRadius: 18.675, left: "calc(33.33% + 83px)", top: 452, transform: "rotate(4deg)" }} innerInset={9.33} innerRadius={9.337} />
      <div style={{
        position: "absolute", background: cream100, overflow: "hidden",
        left: "calc(33.33% + 16px)", top: 436,
        width: 252, height: 391, borderRadius: 18.675, boxShadow: shadowCard, zIndex: 9,
      }}>
        <div style={{ position: "absolute", border: `2px solid ${cream200}`, inset: 9.34, borderRadius: 9.337 }} />
        <div style={{ position: "absolute", display: "flex", flexDirection: "column", alignItems: "center", gap: 19, left: 53, top: 68, width: 146 }}>
          <img alt="flower" src={imgFlower} style={{ width: 134, height: 189, objectFit: "cover", display: "block" }} />
          <button style={{
            background: yellow800, borderRadius: 100, border: "none", cursor: "pointer",
            padding: "8px 16px", boxShadow: "0px 4.669px 23.343px rgba(0,0,0,0.15)", whiteSpace: "nowrap",
          }}>
            <span style={{ fontSize: 14, fontWeight: 600, lineHeight: "22px", color: textColor }}>คำถามประจำวัน</span>
          </button>
        </div>
      </div>

      {/* Feature menus */}
      <FeatureMenu icon={imgIconAdd} iconAlt="add" lines={["วันนี้เป็นไงบ้าง", "เล่าให้เราฟังได้นะ"]} style={{ left: 88, top: 891 }} textSize={18} lineH={26} />
      <FeatureMenu icon={imgIconInsight} iconAlt="insight" lines={["ช่วงนี้ฉันดู", "เป็นยังไงบ้าง?"]} style={{ left: "calc(50% + 94px)", top: 917 }} textSize={18} lineH={26} />

      {/* Donate button */}
      <div style={{ position: "absolute", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", left: "50%", transform: "translateX(-50%)", top: 993 }}>
        <button style={{ background: "#7b8d5b", borderRadius: 8, padding: 16, display: "flex", alignItems: "center", gap: 8, cursor: "pointer", border: "none", width: 197 }}>
          <div style={{ width: 40, height: 40, background: "white", borderRadius: 100, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
            <img alt="donate" src={imgIconDonate} style={{ width: 24, height: 24, objectFit: "contain", display: "block" }} />
          </div>
          <div style={{ color: "white", fontWeight: 600 }}>
            <p style={{ margin: 0, textDecoration: "underline", fontSize: 18, lineHeight: "26px" }}>อยากให้กำลังใจ</p>
            <p style={{ margin: 0, textDecoration: "underline", fontSize: 18, lineHeight: "26px" }}>ทีมงานของเรา?</p>
          </div>
        </button>
        <div style={{ width: 0, height: 0, borderLeft: "9.5px solid transparent", borderRight: "9.5px solid transparent", borderTop: "11px solid #7b8d5b" }} />
      </div>

      {/* Landscape */}
      <div style={{ position: "absolute", overflow: "hidden", zIndex: 5, left: "calc(41.67% + 40px)", transform: "translateX(-50%)", top: 1003, width: 1151, height: 446 }}>
        <img alt="" src={imgLandscape} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }} />
      </div>

      {/* Blob */}
      <div style={{ position: "absolute", overflow: "hidden", pointerEvents: "none", zIndex: 6, left: 55, top: 955, width: 239, height: 200 }}>
        <img alt="" src={imgSprite} style={{ position: "absolute", maxWidth: "none", width: "303.37%", height: "643.22%", left: "-17.13%", top: "-35.01%" }} />
      </div>
      {/* Cactus */}
      <div style={{ position: "absolute", overflow: "hidden", pointerEvents: "none", zIndex: 6, left: "calc(66.67% + 77px)", top: 938, width: 137, height: 209 }}>
        <img alt="" src={imgSprite} style={{ position: "absolute", maxWidth: "none", width: "715.23%", height: "834.78%", left: "-439.07%", top: "-604.13%" }} />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   DESKTOP LAYOUT
   ══════════════════════════════════════════ */
function DesktopLayout() {
  return (
    <div style={{
      position: "relative", width: "100%", minHeight: 1283, overflow: "hidden",
      background: "linear-gradient(to bottom, #aacae5, #edeef0)",
      fontFamily: "'IBM Plex Sans Thai', sans-serif",
    }}>
      {/* Cloud left */}
      <div style={{ position: "absolute", overflow: "hidden", pointerEvents: "none", zIndex: 1, left: -66, top: -14, width: 532, height: 320 }}>
        <img alt="" src={imgCloud} style={{ position: "absolute", maxWidth: "none", width: "292.24%", height: "861.86%", left: "-172.98%", top: "-256.19%" }} />
      </div>
      {/* Cloud right */}
      <div style={{ position: "absolute", overflow: "hidden", pointerEvents: "none", zIndex: 1, left: "calc(75% + 39px)", top: 146, width: 352, height: 213, transform: "scaleX(-1)" }}>
        <img alt="" src={imgCloud} style={{ position: "absolute", maxWidth: "none", width: "292.24%", height: "861.86%", left: "-172.98%", top: "-256.19%" }} />
      </div>

      {/* Centered headline */}
      <p style={{
        position: "absolute", left: "50%", transform: "translateX(-50%)", top: 163,
        fontSize: 32, fontWeight: 600, lineHeight: "40px", color: textColor,
        textAlign: "center", margin: 0, whiteSpace: "nowrap", zIndex: 10,
      }}>
        วันนี้คุณไม่ต้องเก่งก็ได้นะ<br />&nbsp;แค่ยังอยู่ตรงนี้…ก็พอแล้ว
      </p>

      {/* Card stack */}
      <CardBack style={{ width: 252, height: 358, borderRadius: 18.675, left: "calc(33.33% + 44px)", top: 315, transform: "rotate(-4deg)" }} innerInset={9.33} innerRadius={9.337} />
      <CardBack style={{ width: 252, height: 358, borderRadius: 18.675, left: "calc(41.67% + 64px)", top: 315, transform: "rotate(4deg)" }} innerInset={9.33} innerRadius={9.337} />
      <div style={{
        position: "absolute", background: cream100, overflow: "hidden",
        left: "calc(33.33% + 117px)", top: 299,
        width: 252, height: 391, borderRadius: 18.675, boxShadow: shadowCard, zIndex: 9,
      }}>
        <div style={{ position: "absolute", border: `2px solid ${cream200}`, inset: 9.34, borderRadius: 9.337 }} />
        <div style={{ position: "absolute", display: "flex", flexDirection: "column", alignItems: "center", gap: 19, left: 33, top: 68, width: 146 }}>
          <img alt="flower" src={imgFlower} style={{ width: 134, height: 189, objectFit: "cover", display: "block" }} />
          <button style={{
            background: yellow800, borderRadius: 100, border: "none", cursor: "pointer",
            padding: "8px 16px", boxShadow: "0px 4.669px 23.343px rgba(0,0,0,0.15)", whiteSpace: "nowrap",
          }}>
            <span style={{ fontSize: 14, fontWeight: 600, lineHeight: "22px", color: textColor }}>คำถามประจำวัน</span>
          </button>
        </div>
      </div>

      {/* Feature menus */}
      <FeatureMenu icon={imgIconAdd} iconAlt="add" lines={["วันนี้เป็นไงบ้าง", "เล่าให้เราฟังได้นะ"]} style={{ left: "calc(25% + 37px)", top: 738 }} textSize={18} lineH={26} />
      <FeatureMenu icon={imgIconInsight} iconAlt="insight" lines={["ช่วงนี้ฉันดู", "เป็นยังไงบ้าง?"]} style={{ left: "calc(58.33% + 51px)", top: 764 }} textSize={18} lineH={26} />

      {/* Donate button */}
      <div style={{ position: "absolute", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", left: "50%", transform: "translateX(-50%)", top: 840 }}>
        <button style={{ background: "#7b8d5b", borderRadius: 8, padding: 16, display: "flex", alignItems: "center", gap: 8, cursor: "pointer", border: "none", width: 197 }}>
          <div style={{ width: 40, height: 40, background: "white", borderRadius: 100, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
            <img alt="donate" src={imgIconDonate} style={{ width: 24, height: 24, objectFit: "contain", display: "block" }} />
          </div>
          <div style={{ color: "white", fontWeight: 600 }}>
            <p style={{ margin: 0, textDecoration: "underline", fontSize: 18, lineHeight: "26px" }}>อยากให้กำลังใจ</p>
            <p style={{ margin: 0, textDecoration: "underline", fontSize: 18, lineHeight: "26px" }}>ทีมงานของเรา?</p>
          </div>
        </button>
        <div style={{ width: 0, height: 0, borderLeft: "9.5px solid transparent", borderRight: "9.5px solid transparent", borderTop: "11px solid #7b8d5b" }} />
      </div>

      {/* Landscape */}
      <div style={{ position: "absolute", overflow: "hidden", zIndex: 5, left: "calc(50% + 2.5px)", transform: "translateX(-50%)", top: 837, width: 1151, height: 446 }}>
        <img alt="" src={imgLandscape} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }} />
      </div>

      {/* Blob */}
      <div style={{ position: "absolute", overflow: "hidden", pointerEvents: "none", zIndex: 6, left: "calc(16.67% + 106px)", top: 806, width: 239, height: 200 }}>
        <img alt="" src={imgSprite} style={{ position: "absolute", maxWidth: "none", width: "303.37%", height: "643.22%", left: "-17.13%", top: "-35.01%" }} />
      </div>
      {/* Cactus */}
      <div style={{ position: "absolute", overflow: "hidden", pointerEvents: "none", zIndex: 6, left: "calc(66.67% + 44px)", top: 797, width: 137, height: 209 }}>
        <img alt="" src={imgSprite} style={{ position: "absolute", maxWidth: "none", width: "715.23%", height: "834.78%", left: "-439.07%", top: "-604.13%" }} />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   ENTRY POINT
   ══════════════════════════════════════════ */
export default function Desktop1() {
  const bp = useBreakpoint();
  if (bp === "tablet")  return <TabletLayout />;
  if (bp === "desktop") return <DesktopLayout />;
  return <MobileLayout />;
}
