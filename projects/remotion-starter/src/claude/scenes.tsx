import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  AlertTriangle,
  Ban,
  Check,
  CreditCard,
  Crown,
  Gift,
  Lock,
  Mail,
  MessageCircle,
  Receipt,
  Shield,
  Zap,
} from "lucide-react";
import { ClaudeChatAndArtifactMockup } from "./ClaudeChatAndArtifactMockup";
import { KineticWords } from "./Stage";
import { ClaudeColors } from "./theme";
import { hits } from "./voiceWords";

const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 18, stiffness: 100 } });
  return (
    <AbsoluteFill
      style={{
        padding: "156px 36px 248px",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        opacity: interpolate(frame, [0, 6], [0, 1], { extrapolateRight: "clamp" }),
        transform: `scale(${interpolate(enter, [0, 1], [0.96, 1])})`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

const Ghost: React.FC<{ text: string; top?: number }> = ({ text, top = 200 }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        left: -10,
        top,
        fontFamily: '"Playfair Display", Georgia, serif',
        fontWeight: 700,
        fontSize: 200,
        lineHeight: 0.8,
        color: ClaudeColors.alabaster,
        opacity: 0.07,
        whiteSpace: "nowrap",
        transform: `translateX(${Math.sin(frame / 35) * 18}px)`,
        pointerEvents: "none",
      }}
    >
      {text}
    </div>
  );
};

const FeatureRow: React.FC<{
  icon: React.ReactNode;
  text: string;
  delay: number;
  hot: boolean;
  from: "left" | "right";
  fill?: boolean;
  mark?: string;
}> = ({ icon, text, delay, hot, from, fill, mark }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({
    frame: frame - delay,
    fps,
    config: { damping: 13, stiffness: 150 },
  });
  const x = interpolate(enter, [0, 1], [from === "left" ? -260 : 260, 0]);
  const bob = Math.sin((frame + delay * 4) / 12) * 6;
  return (
    <div
      style={{
        display: "flex",
        gap: 14,
        alignItems: "center",
        padding: "16px 16px",
        borderRadius: 20,
        background: hot ? "rgba(217,119,87,0.22)" : "rgba(250,249,245,0.06)",
        border: `2px solid ${hot ? ClaudeColors.coral : "rgba(250,249,245,0.14)"}`,
        boxShadow: hot ? `0 0 32px ${ClaudeColors.coral}66` : "0 10px 30px rgba(0,0,0,0.25)",
        transform: `translateX(${x}px) translateY(${bob}px) scale(${hot ? 1.045 : 1})`,
        opacity: enter,
        flex: fill ? 1 : undefined,
      }}
    >
      <div style={{ flexShrink: 0 }}>{icon}</div>
      <div
        style={{
          fontFamily: '"Hind Siliguri", sans-serif',
          fontWeight: 700,
          fontSize: fill ? 40 : 34,
          lineHeight: 1.22,
          letterSpacing: 0,
          color: ClaudeColors.alabaster,
        }}
      >
        {text}
      </div>
      {mark ? (
        <div
          style={{
            marginLeft: "auto",
            fontFamily: '"Playfair Display", Georgia, serif',
            fontWeight: 700,
            fontSize: 64,
            lineHeight: 0.9,
            color: ClaudeColors.coral,
            opacity: 0.85,
          }}
        >
          {mark}
        </div>
      ) : null}
    </div>
  );
};

export const Scene1: React.FC<{ word: string }> = ({ word }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const card = spring({ frame: frame - 4, fps, config: { damping: 14, stiffness: 120 } });
  const pulse = 0.55 + Math.sin(frame / 5) * 0.45;
  const drain = interpolate(frame, [6, 46], [100, 7], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const limitHot = hits(word, ["limit", "লিমিট", "ইউজেজ", "usage", "শেষ", "claude", "ক্লদ", "ক্লড"]);
  const cardHot = hits(word, ["card", "কার্ড", "declin", "কারেন্সি"]);
  const banHot = hits(word, ["ban", "ব্যান", "cookie", "কুকি", "শেয়ার", "শেয়ার"]);
  const badges = spring({ frame: frame - 16, fps, config: { damping: 12, stiffness: 140 } });

  return (
    <Shell>
      <Ghost text="LIMIT" top={230} />
      <KineticWords
        text="প্রজেক্টের মাঝখানে বারবার Claude-এর Usage Limit শেষ?"
        size={76}
        accent={["Claude-এর", "Usage", "Limit", "শেষ?"]}
      />
      <div
        style={{
          marginTop: 22,
          borderRadius: 28,
          overflow: "hidden",
          background: "#161514",
          border: `2px solid ${limitHot ? "#F87171" : "rgba(250,249,245,0.14)"}`,
          boxShadow: limitHot ? "0 0 40px rgba(239,68,68,0.45)" : "0 20px 50px rgba(0,0,0,0.4)",
          transform: `translateY(${interpolate(card, [0, 1], [80, Math.sin(frame / 13) * 8])}px) rotate(${interpolate(card, [0, 1], [-2.5, 0])}deg) scale(${limitHot ? 1.03 : 1})`,
          opacity: card,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}
      >
        <div
          style={{
            padding: "14px 16px",
            fontFamily: '"JetBrains Mono", "Hind Siliguri", monospace',
            fontSize: 22,
            fontWeight: 700,
            color: ClaudeColors.alabaster,
            borderBottom: "1px solid rgba(250,249,245,0.1)",
          }}
        >
          Claude • chat
        </div>
        <div
          style={{
            margin: 14,
            padding: "16px 16px",
            borderRadius: 16,
            background: `rgba(239,68,68,${0.18 + pulse * 0.16})`,
            border: `2px solid rgba(248,113,113,${0.5 + pulse * 0.4})`,
            color: "#FEE2E2",
            fontFamily: '"Hind Siliguri", sans-serif',
            fontWeight: 700,
            fontSize: 36,
            lineHeight: 1.25,
            letterSpacing: 0,
            display: "flex",
            gap: 12,
            alignItems: "center",
          }}
        >
          <AlertTriangle size={40} color="#FCA5A5" style={{ transform: `rotate(${Math.sin(frame / 4) * 8}deg)` }} />
          <span>Claude Usage Limit Reached • Come back later</span>
        </div>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "8px 22px 0",
          }}
        >
          <div
            style={{
              width: 300,
              height: 300,
              borderRadius: 999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: `conic-gradient(#F87171 ${Math.max(8, drain) * 3.6}deg, rgba(250,249,245,0.08) 0deg)`,
              transform: `rotate(${frame * 2}deg) scale(${0.96 + pulse * 0.05})`,
            }}
          >
            <div
              style={{
                width: 214,
                height: 214,
                borderRadius: 999,
                background: "#141312",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transform: `rotate(${-frame * 2}deg)`,
                fontFamily: '"Playfair Display", Georgia, serif',
                fontWeight: 700,
                fontSize: 84,
                color: "#F87171",
                textShadow: "0 0 18px rgba(239,68,68,0.85)",
              }}
            >
              {Math.round(drain)}%
            </div>
          </div>
          <div
            style={{
              fontFamily: '"Hind Siliguri", sans-serif',
              fontWeight: 700,
              fontSize: 36,
              letterSpacing: 0,
              color: ClaudeColors.alabaster,
            }}
          >
            Usage বাকি নেই
          </div>
        </div>
        <div style={{ margin: "0 16px 16px" }}>
          <div
            style={{
              height: 18,
              borderRadius: 99,
              background: "rgba(250,249,245,0.08)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${drain}%`,
                height: "100%",
                background: "linear-gradient(90deg, #F87171, #EF4444)",
                boxShadow: "0 0 16px #EF4444",
              }}
            />
          </div>
          <div
            style={{
              marginTop: 8,
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 20,
              color: "#FCA5A5",
              fontWeight: 700,
            }}
          >
            USAGE {Math.round(drain)}% LEFT
          </div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "14px 16px",
            borderRadius: 16,
            background: "rgba(239,68,68,0.12)",
            border: `2px solid ${cardHot ? "#F87171" : "rgba(248,113,113,0.45)"}`,
            color: "#FECACA",
            fontFamily: '"Hind Siliguri", sans-serif',
            fontWeight: 700,
            fontSize: 36,
            letterSpacing: 0,
            textDecoration: "line-through",
            textDecorationThickness: 3,
            opacity: badges,
            transform: `translateX(${interpolate(badges, [0, 1], [-80, 0])}px) translateY(${Math.sin(frame / 11) * 5}px) scale(${cardHot ? 1.05 : 1})`,
          }}
        >
          <CreditCard size={32} />
          Card Declined
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "14px 16px",
            borderRadius: 16,
            background: "rgba(239,68,68,0.12)",
            border: `2px solid ${banHot ? "#F87171" : "rgba(248,113,113,0.45)"}`,
            color: "#FECACA",
            fontFamily: '"Hind Siliguri", sans-serif',
            fontWeight: 700,
            fontSize: 36,
            letterSpacing: 0,
            textDecoration: "line-through",
            textDecorationThickness: 3,
            opacity: badges,
            transform: `translateX(${interpolate(badges, [0, 1], [80, 0])}px) translateY(${Math.sin(frame / 9) * 5}px) scale(${banHot ? 1.05 : 1})`,
          }}
        >
          <Ban size={32} />
          Shared Cookie Ban Risk
        </div>
      </div>
    </Shell>
  );
};

export const Scene2: React.FC<{ word: string }> = ({ word }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const modal = spring({ frame: frame - 2, fps, config: { damping: 12, stiffness: 110 } });
  const seal = spring({ frame: frame - 18, fps, config: { damping: 11, stiffness: 140 } });
  const mailHot = hits(word, ["email", "ইমেইল", "ইমেইলে", "invite", "আমন্ত্রণ"]);
  const payHot = hits(word, ["bkash", "বিকাশ", "nagad", "নগদ", "নগদে"]);
  const entHot = hits(word, ["enterprise", "এন্টারপ্রাইজ", "claude", "ক্লড", "অফিশিয়াল", "অফিসিয়াল"]);

  return (
    <Shell>
      <Ghost text="INVITE" />
      <KineticWords
        text="সরাসরি আপনার ইমেইলে অফিশিয়াল Claude Enterprise — বিকাশ ও নগদে!"
        size={60}
        accent={["Claude", "Enterprise", "বিকাশ", "নগদে!"]}
      />
      <div
        style={{
          marginTop: 26,
          borderRadius: 32,
          padding: 26,
          background: "linear-gradient(180deg, rgba(250,249,245,0.08), rgba(250,249,245,0.03))",
          border: `2px solid ${entHot ? ClaudeColors.coral : "rgba(250,249,245,0.16)"}`,
          boxShadow: entHot
            ? `0 0 48px ${ClaudeColors.coral}77`
            : "0 24px 60px rgba(0,0,0,0.4)",
          transform: `translateY(${interpolate(modal, [0, 1], [90, Math.sin(frame / 15) * 6])}px) scale(${interpolate(modal, [0, 1], [0.84, entHot ? 1.03 : 1])})`,
          opacity: modal,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 74,
              height: 74,
              borderRadius: 20,
              background: ClaudeColors.coral,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: `rotate(${Math.sin(frame / 10) * 6}deg) scale(${mailHot ? 1.12 : 1})`,
            }}
          >
            <Mail size={40} color="#1A0E0A" />
          </div>
          <div
            style={{
              fontFamily: '"Playfair Display", Georgia, serif',
              fontWeight: 700,
              fontSize: 40,
              lineHeight: 1.05,
              color: ClaudeColors.alabaster,
            }}
          >
            You've been invited to Claude Enterprise Workspace
          </div>
        </div>
        <div
          style={{
            marginTop: 18,
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 14px",
            borderRadius: 14,
            background: mailHot ? "rgba(16,185,129,0.2)" : "rgba(16,185,129,0.1)",
            border: `2px solid ${ClaudeColors.emerald}`,
            color: ClaudeColors.alabaster,
            fontFamily: '"Hind Siliguri", sans-serif',
            fontWeight: 700,
            fontSize: 30,
            letterSpacing: 0,
            transform: `scale(${mailHot ? 1.04 : 1})`,
          }}
        >
          <Lock size={28} color={ClaudeColors.emerald} />
          100% Private Own Email
        </div>
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontFamily: '"Playfair Display", Georgia, serif',
              fontWeight: 700,
              fontSize: 84,
              lineHeight: 0.92,
              color: ClaudeColors.alabaster,
              transform: `scale(${1 + Math.sin(frame / 9) * 0.045})`,
              textShadow: `0 0 24px ${ClaudeColors.coral}66`,
            }}
          >
            Claude
            <br />
            Enterprise
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
          {[
            { name: "bKash", bg: "#E2136E", dy: 0 },
            { name: "Nagad", bg: "#F47920", dy: 18 },
          ].map((p) => (
            <div
              key={p.name}
              style={{
                flex: 1,
                textAlign: "center",
                padding: "18px 8px",
                borderRadius: 18,
                background: p.bg,
                color: "#fff",
                fontFamily: '"Hind Siliguri", sans-serif',
                fontWeight: 700,
                fontSize: 36,
                transform: `translateY(${Math.sin((frame + p.dy) / 9) * 10}px) scale(${payHot ? 1.06 : 1})`,
                boxShadow: payHot ? "0 0 28px rgba(255,255,255,0.35)" : "0 12px 24px rgba(0,0,0,0.3)",
              }}
            >
              {p.name}
            </div>
          ))}
        </div>
        <div
          style={{
            marginTop: 16,
            alignSelf: "flex-end",
            display: "inline-flex",
            padding: "8px 14px",
            borderRadius: 999,
            border: `2px dashed ${ClaudeColors.coral}`,
            color: ClaudeColors.coral,
            fontFamily: '"JetBrains Mono", monospace',
            fontWeight: 700,
            fontSize: 22,
            transform: `rotate(${interpolate(seal, [0, 1], [-18, -8])}deg) scale(${seal})`,
            opacity: seal,
          }}
        >
          OFFICIAL INVITE
        </div>
      </div>
    </Shell>
  );
};

export const Scene3: React.FC<{ word: string }> = ({ word }) => {
  const frame = useCurrentFrame();
  const rows = [
    {
      text: "সাধারণ Pro প্ল্যানের চেয়ে অনেক বেশি Usage Limit",
      keys: ["pro", "প্রো", "usage", "লিমিট", "limit"],
    },
    {
      text: "Research, Docs ও Full-Stack Coding",
      keys: ["research", "docs", "coding", "কোড", "ফুল"],
    },
    {
      text: "নিজস্ব ইমেইলে ১০০% প্রাইভেট Claude Workspace",
      keys: ["ইমেইল", "প্রাইভেট", "private", "workspace", "claude"],
    },
  ];
  return (
    <Shell>
      <Ghost text="CORE" top={250} />
      <div
        style={{
          fontFamily: '"Playfair Display", Georgia, serif',
          fontWeight: 700,
          fontSize: 64,
          lineHeight: 0.95,
          color: ClaudeColors.alabaster,
          transform: `translateY(${Math.sin(frame / 16) * 4}px)`,
        }}
      >
        Claude Core Enterprise
      </div>
      <div
        style={{
          marginTop: 8,
          marginBottom: 18,
          fontFamily: '"JetBrains Mono", "Hind Siliguri", monospace',
          fontSize: 22,
          fontWeight: 700,
          color: ClaudeColors.coral,
        }}
      >
        TIER 1 • PRIVATE WORKSPACE
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, flex: 1 }}>
        {rows.map((row, i) => (
          <FeatureRow
            key={row.text}
            icon={
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: ClaudeColors.emerald,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Check size={30} color="#052e1a" strokeWidth={3} />
              </div>
            }
            text={row.text}
            delay={6 + i * 7}
            hot={hits(word, row.keys)}
            from={i % 2 === 0 ? "left" : "right"}
            fill
            mark={`0${i + 1}`}
          />
        ))}
      </div>
    </Shell>
  );
};

export const Scene4: React.FC<{ word: string }> = ({ word }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const surge = interpolate(frame, [8, 55], [1, 5], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const burst = spring({
    frame: frame - 52,
    fps,
    config: { damping: 9, stiffness: 160 },
  });
  const arrived = surge >= 4.85;
  const shake = arrived && frame < 78 ? Math.sin(frame * 2) * 7 : 0;
  const hot = hits(word, ["5x", "max", "ম্যাক্স", "ফাইভ", "গুণ", "claude", "ক্লড", "কোড", "code", "ফ্ল্যাগ"]);
  const bars = [1, 2, 3, 4, 5];

  return (
    <Shell>
      <div style={{ transform: `translateX(${shake}px)`, display: "flex", flexDirection: "column", flex: 1, gap: 8 }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div
              style={{
                fontFamily: '"Playfair Display", Georgia, serif',
                fontWeight: 700,
                fontSize: arrived ? 120 : 96,
                lineHeight: 0.85,
                color: ClaudeColors.coral,
                textShadow: `0 0 ${20 + Math.sin(frame / 6) * 10}px ${ClaudeColors.coral}`,
                transform: `scale(${arrived ? interpolate(burst, [0, 1], [0.8, hot ? 1.06 : 1]) : 1})`,
              }}
            >
              {arrived ? "5X" : `${surge.toFixed(1)}X`}
            </div>
            <div
              style={{
                fontFamily: '"Hind Siliguri", sans-serif',
                fontWeight: 700,
                fontSize: 28,
                letterSpacing: 0,
                color: ClaudeColors.alabaster,
              }}
            >
              CLAUDE 5X MAX THROUGHPUT
            </div>
          </div>
          <Crown size={64} color={ClaudeColors.coral} style={{ transform: `rotate(${Math.sin(frame / 8) * 8}deg)` }} />
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 12, marginBottom: 12 }}>
          {bars.map((n) => {
            const on = surge >= n - 0.15;
            return (
              <div
                key={n}
                style={{
                  flex: 1,
                  height: on ? 28 + n * 6 : 16,
                  borderRadius: 8,
                  background: on ? ClaudeColors.coral : "rgba(250,249,245,0.1)",
                  boxShadow: on ? `0 0 16px ${ClaudeColors.coral}` : "none",
                  transform: `scaleY(${on ? 1 : 0.6})`,
                }}
              />
            );
          })}
        </div>
        <ClaudeChatAndArtifactMockup hot={hot} />
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
          <FeatureRow
            icon={<Crown size={32} color={ClaudeColors.coral} />}
            text="CLAUDE 5X MAX WORKSPACE"
            delay={8}
            hot={hot}
            from="left"
          />
          <FeatureRow
            icon={<Zap size={32} color={ClaudeColors.coral} />}
            text="Claude Code ও Next-Gen Flagship Model ফুল অ্যাক্সেস"
            delay={14}
            hot={hits(word, ["code", "কোড", "model", "মডেল", "flagship"])}
            from="right"
          />
          <FeatureRow
            icon={<Check size={32} color={ClaudeColors.emerald} />}
            text="একটানা ৫ গুণ বেশি এজেন্টিক কোডিং ও আর্কিটেকচার ক্ষমতা"
            delay={20}
            hot={hits(word, ["কোডিং", "আর্কিটেকচার", "গুণ", "এজেন্ট"])}
            from="left"
          />
          <FeatureRow
            icon={<Check size={32} color={ClaudeColors.emerald} />}
            text="আন্তর্জাতিক খরচের অর্ধেকেরও কম বাজেটে!"
            delay={26}
            hot={hits(word, ["বাজেট", "খরচ", "অর্ধেক", "দাম"])}
            from="right"
          />
        </div>
      </div>
    </Shell>
  );
};

export const Scene5: React.FC<{ word: string }> = ({ word }) => {
  const cards = [
    {
      icon: <Gift size={36} color="#1A0E0A" />,
      title: "FREE: 10X Claude Token-Saver Playbook (CLAUDE.md Vault)",
      keys: ["free", "ফ্রি", "playbook", "প্লেবুক", "token", "টোকেন", "এক্সক্লুসিভ", "ইনভয়েস", "অপটিমাইজেশন"],
      tint: ClaudeColors.coral,
    },
    {
      icon: <Shield size={36} color="#052e1a" />,
      title: "২ ঘণ্টার Instant Workspace Replacement গ্যারান্টি",
      keys: ["গ্যারান্টি", "ঘণ্টা", "ঘণ্টার", "replacement", "instant"],
      tint: ClaudeColors.emerald,
    },
    {
      icon: <Receipt size={36} color="#1A0E0A" />,
      title: "অফিশিয়াল B2B Corporate Invoice",
      keys: ["invoice", "ইনভয়েস", "b2b", "কর্পোরেট", "অফিশিয়াল"],
      tint: "#F5D0A9",
    },
  ];
  return (
    <Shell>
      <Ghost text="FREE" top={210} />
      <KineticWords text="ফ্রি ভ্যালু স্ট্যাক — Claude বোনাস" size={64} accent={["Claude", "ফ্রি", "বোনাস"]} />
      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 22, flex: 1 }}>
        {cards.map((card, i) => (
          <FeatureRow
            key={card.title}
            icon={
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 18,
                  background: card.tint,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {card.icon}
              </div>
            }
            text={card.title}
            delay={4 + i * 8}
            hot={hits(word, card.keys)}
            from={i % 2 === 0 ? "left" : "right"}
            fill
            mark={`0${i + 1}`}
          />
        ))}
      </div>
    </Shell>
  );
};

export const Scene6: React.FC<{ word: string }> = ({ word }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 12, stiffness: 120 } });
  const pulse = 1 + Math.sin(frame / 7) * 0.045;
  const sheen = interpolate(frame % 80, [0, 80], [-240, 820]);
  const hot = hits(word, ["claude", "ক্লড", "কমেন্ট", "ইনবক্স", "inbox", "comment"]);
  const spin = interpolate(frame, [0, 200], [0, 360], { extrapolateRight: "extend" });
  const marquee = interpolate(frame % 240, [0, 240], [0, -900]);

  return (
    <Shell>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "space-between", gap: 18, flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, opacity: enter }}>
          <svg width="92" height="92" viewBox="0 0 92 92" style={{ transform: `rotate(${spin}deg)` }}>
            <polygon
              points="46,2 54,34 88,34 60,54 70,88 46,68 22,88 32,54 4,34 38,34"
              fill={ClaudeColors.coral}
            />
          </svg>
          <div
            style={{
              fontFamily: '"Playfair Display", Georgia, serif',
              fontWeight: 700,
              fontSize: 68,
              lineHeight: 0.92,
              color: ClaudeColors.alabaster,
            }}
          >
            Claude
            <br />
            Enterprise
          </div>
        </div>
        <div
          style={{
            flex: 1,
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                width: 180 + i * 110,
                height: 180 + i * 110,
                borderRadius: 999,
                border: `2px solid rgba(217,119,87,${0.5 - i * 0.14})`,
                transform: `scale(${0.85 + ((frame / 28 + i * 0.2) % 1) * 0.35})`,
              }}
            />
          ))}
          <div
            style={{
              fontFamily: '"Playfair Display", Georgia, serif',
              fontWeight: 700,
              fontSize: 92,
              color: ClaudeColors.coral,
              textShadow: `0 0 ${18 + Math.sin(frame / 6) * 10}px ${ClaudeColors.coral}`,
              transform: `scale(${pulse})`,
            }}
          >
            CLAUDE
          </div>
        </div>
        <div
          style={{
            width: "100%",
            marginTop: 10,
            borderRadius: 28,
            padding: "28px 22px",
            background: `linear-gradient(90deg, ${ClaudeColors.coral}, #E39A7E 45%, ${ClaudeColors.emerald})`,
            transform: `scale(${pulse * (hot ? 1.04 : 1)})`,
            boxShadow: `0 0 ${30 + Math.sin(frame / 6) * 16}px ${ClaudeColors.coral}`,
            position: "relative",
            overflow: "hidden",
            opacity: enter,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              width: 120,
              left: sheen,
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent)",
            }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              position: "relative",
              fontFamily: '"Hind Siliguri", sans-serif',
              fontWeight: 700,
              fontSize: 46,
              lineHeight: 1.2,
              letterSpacing: 0,
              color: "#140E0C",
            }}
          >
            <MessageCircle size={40} color="#140E0C" />
            কমেন্ট করুন 'CLAUDE' অথবা সরাসরি ইনবক্স করুন
          </div>
        </div>
        <div
          style={{
            width: "100%",
            overflow: "hidden",
            marginTop: 8,
            borderRadius: 16,
            background: "rgba(250,249,245,0.06)",
            border: "1px solid rgba(250,249,245,0.14)",
            padding: "14px 0",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 28,
              whiteSpace: "nowrap",
              transform: `translateX(${marquee}px)`,
              fontFamily: '"Hind Siliguri", sans-serif',
              fontWeight: 700,
              fontSize: 30,
              letterSpacing: 0,
              color: ClaudeColors.alabaster,
            }}
          >
            <span>সীমিত সিট খালি আছে</span>
            <span style={{ color: ClaudeColors.coral }}>•</span>
            <span>Instant Email Invite</span>
            <span style={{ color: ClaudeColors.emerald }}>•</span>
            <span>bKash / Nagad</span>
            <span style={{ color: ClaudeColors.coral }}>•</span>
            <span>সীমিত সিট খালি আছে</span>
            <span>Instant Email Invite</span>
            <span>bKash / Nagad</span>
          </div>
        </div>
      </div>
    </Shell>
  );
};
