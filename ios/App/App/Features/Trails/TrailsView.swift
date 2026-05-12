// TrailsView.swift
// Trail list — Borges Pack, PHX→PVR travel pack, future packs.

import SwiftUI

struct TrailsView: View {
    @EnvironmentObject var session: SessionStore
    @State private var trails: [Trail] = Trail.previewList

    var body: some View {
        NavigationStack {
            List(trails) { trail in
                NavigationLink(value: trail) {
                    VStack(alignment: .leading, spacing: 4) {
                        Text(trail.label).font(.headline)
                        if let pack = trail.packId {
                            Text(pack)
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                    }
                    .padding(.vertical, 4)
                }
            }
            .navigationTitle("Trails")
            .navigationDestination(for: Trail.self) { trail in
                Text("Trail detail — wired in PR #3")
                    .navigationTitle(trail.label)
            }
        }
    }
}

#Preview { TrailsView().environmentObject(SessionStore()) }
