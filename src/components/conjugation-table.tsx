"use client";

import React from "react";
import { conjugationRowsFromVerb, presentConjugationTable } from "../grammar/conjugation/conjugator";
import type { VerbEntry } from "../lib/types";

export function ConjugationTable({ verb, infinitive }: { verb?: VerbEntry; infinitive: string }) {
  const table = verb ? conjugationRowsFromVerb(verb) : presentConjugationTable(infinitive);

  return (
    <div style={{ marginTop: 12, marginBottom: 12 }}>
      <div style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: 6 }}>
        Conjugation (present) — {verb?.infinitive ?? infinitive}
      </div>
      <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 10px", fontSize: "0.95rem" }}>
        <tbody>
          {table.map((row) => (
            <tr key={`${row.left.label}-${row.right.label}`}>
              <td style={{ width: "50%", paddingRight: 6 }}>
                <div style={{ borderRadius: 12, padding: "10px 12px", background: "rgba(148,163,184,0.08)", border: "1px solid var(--border)" }}>
                  <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--muted-foreground)", marginBottom: 4 }}>
                    {row.left.label}
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800 }}>{row.left.form}</div>
                </div>
              </td>
              <td style={{ width: "50%", paddingLeft: 6 }}>
                <div style={{ borderRadius: 12, padding: "10px 12px", background: "rgba(148,163,184,0.08)", border: "1px solid var(--border)" }}>
                  <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--muted-foreground)", marginBottom: 4 }}>
                    {row.right.label}
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800 }}>{row.right.form}</div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
