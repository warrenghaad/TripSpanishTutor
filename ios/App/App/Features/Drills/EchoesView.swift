// EchoesView.swift
// Personal Echoes — the learner's own writing anchored to poems. Never evaluated.

import SwiftUI

struct EchoesView: View {
    var body: some View {
        NavigationStack {
            VStack(spacing: 12) {
                Image(systemName: "quote.opening")
                    .font(.system(size: 40))
                    .foregroundStyle(.tertiary)
                Text("Personal Echoes")
                    .font(.title2.weight(.medium))
                Text("Write a 3-line response to any poem in the Borges Pack. No grading, no scoring — your writing is the trail's artifact.")
                    .font(.callout)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 32)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .navigationTitle("Echoes")
        }
    }
}

#Preview { EchoesView() }
