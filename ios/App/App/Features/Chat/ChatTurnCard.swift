// ChatTurnCard.swift
// The augmented chat card — exact shape from the project plan PDF (§07).
// Every turn is a rich card with a peelable English gloss, token-level annotations,
// alternate phrasings, and one-tap drill hooks for the skill the message exercises.

import SwiftUI

struct ChatTurnCard: View {
    let turn: ChatTurn
    @State private var glossShown = false

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {

            // 1. Canonical Spanish — large, primary
            SpanishLine(turn.surface.es, annotations: turn.surface.annotations)

            // 2. Gloss strip — collapsed by default, tap to peel
            DisclosureGroup(isExpanded: $glossShown) {
                Text(turn.surface.en)
                    .font(.callout)
                    .foregroundStyle(.secondary)
                    .padding(.top, 4)
            } label: {
                Text("ver en inglés")
                    .font(.caption)
                    .foregroundStyle(.tertiary)
            }

            // 3. Alternates — chip row
            if !turn.surface.alts.isEmpty {
                ChipRow(items: turn.surface.alts, label: "también podrías decir")
            }

            // 4. Drill hooks — one tap to start a ~20s micro-drill
            ForEach(turn.surface.drillHooks, id: \.skillId) { hook in
                DrillHookButton(hook: hook)
            }

            // 5. Offline chip — shows when this surface wasn't swarm-validated in real time
            if turn.wasOffline {
                Label("offline", systemImage: "wifi.slash")
                    .font(.caption2)
                    .foregroundStyle(.tertiary)
            }
        }
        .padding(14)
        .background(.thinMaterial, in: .rect(cornerRadius: 14))
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}

/// Spanish line with inline token annotations rendered as subtle underlines.
struct SpanishLine: View {
    let text: String
    let annotations: [Annotation]

    init(_ text: String, annotations: [Annotation]) {
        self.text = text
        self.annotations = annotations
    }

    var body: some View {
        // v0: render plain. Per-token annotation rendering arrives in PR #3
        // when we have AttributedString-based highlighting wired.
        Text(text)
            .font(.title3.weight(.medium))
            .textSelection(.enabled)
    }
}

/// Horizontal chip row for alternate phrasings.
struct ChipRow: View {
    let items: [String]
    let label: String

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(label)
                .font(.caption2)
                .foregroundStyle(.tertiary)
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 6) {
                    ForEach(items, id: \.self) { item in
                        Text(item)
                            .font(.footnote)
                            .padding(.horizontal, 10)
                            .padding(.vertical, 5)
                            .background(.regularMaterial, in: Capsule())
                    }
                }
            }
        }
    }
}

/// Tap to start a micro-drill for the skill this turn exercises.
struct DrillHookButton: View {
    let hook: DrillHook

    var body: some View {
        Button {
            // PR #3 wires this to DrillStore.start(hook)
        } label: {
            HStack(spacing: 6) {
                Image(systemName: "sparkle")
                Text("practicar — \(hook.skillId)")
                    .font(.footnote)
            }
            .padding(.horizontal, 10)
            .padding(.vertical, 6)
            .background(.tint.opacity(0.12), in: Capsule())
        }
        .buttonStyle(.plain)
    }
}

#Preview {
    ChatTurnCard(turn: .preview)
        .padding()
}
