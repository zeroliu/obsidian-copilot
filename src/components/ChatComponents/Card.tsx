import React, { PropsWithChildren } from "react";

interface CardProps {
  title: string;
  description?: string;
  cta?: React.ReactNode;
}

export function Card({ children, title, description, cta }: PropsWithChildren<CardProps>) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        backgroundColor: "var(--interactive-normal)",
        borderRadius: "0.5rem",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "1rem",
          borderBottom: "1px solid var(--color-base-50)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.5rem",
          }}
        >
          <b style={{ fontSize: "1rem" }}>{title}</b>
          {cta}
        </div>
        {description && (
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{description}</div>
        )}
      </div>
      {children}
    </div>
  );
}

interface CardItemProps {
  onClick: () => void;
  leftIcon: React.ReactNode;
  rightIcon: React.ReactNode;
  isLast?: boolean;
}

export function CardItem({
  children,
  leftIcon,
  rightIcon,
  isLast,
  onClick,
}: PropsWithChildren<CardItemProps>) {
  return (
    <button
      style={{
        boxShadow: "none",
        cursor: "pointer",
        display: "flex",
        height: "fit-content",
        gap: "0.5rem",
        alignItems: "start",
        justifyContent: "space-between",
        padding: "1rem",
        width: "100%",
        overflow: "hidden",
        borderBottom: isLast ? "none" : "1px solid var(--color-base-40)",
        borderRadius: "0",
      }}
      onClick={onClick}
    >
      <div style={{ display: "flex", alignItems: "center", height: "1.2rem", flexShrink: 0 }}>
        {leftIcon}
      </div>
      <div
        style={{
          flex: 1,
          textAlign: "left",
          overflow: "hidden",
        }}
      >
        {children}
      </div>
      <div style={{ display: "flex", alignItems: "center", height: "1.2rem", flexShrink: 0 }}>
        {rightIcon}
      </div>
    </button>
  );
}
