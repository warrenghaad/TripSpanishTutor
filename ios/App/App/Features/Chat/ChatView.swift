// ChatView.swift
//
// The translator surface. This is what opens when you launch the app — no
// navigation, no tab bar, no menu. The input is focused on appear. Type or
// hold-to-speak. Every turn renders as an augmented card.
//
// Trails and Echoes are toolbar buttons, not tabs.

import SwiftUI

struct ChatView: View {
    @EnvironmentObject var session: SessionStore
    @State private var draft: String = ""
    @State private var turns: [ChatTurn] = [.preview, .previewLearner]
    @FocusState private var inputFocused: Bool
    @State private var showTrails = false
    @State private var showEchoes = false

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                conversation
                inputBar
            }
            .background(.background)
            .navigationTitle("")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar { toolbar }
            .sheet(isPresented: $showTrails) { TrailsView() }
            .sheet(isPresented: $showEchoes) { EchoesView() }
            .onAppear { inputFocused = true } // open straight into the translator
        }
    }

    // MARK: - Conversation

    private var conversation: some View {
        ScrollViewReader { proxy in
            ScrollView {
                LazyVStack(spacing: 12) {
                    ForEach(turns) { turn in
                        ChatTurnCard(turn: turn)
                            .padding(.horizontal)
                            .id(turn.id)
                    }
                }
                .padding(.vertical)
            }
            .onChange(of: turns.count) { _, _ in
                if let last = turns.last {
                    withAnimation { proxy.scrollTo(last.id, anchor: .bottom) }
                }
            }
        }
    }

    // MARK: - Input

    private var inputBar: some View {
        HStack(spacing: 10) {
            TextField("escribe o mantén presionado el micrófono…", text: $draft, axis: .vertical)
                .lineLimit(1...4)
                .textFieldStyle(.plain)
                .focused($inputFocused)
                .padding(10)
                .background(.regularMaterial, in: .rect(cornerRadius: 14))
                .submitLabel(.send)
                .onSubmit(send)

            Button(action: holdMic) {
                Image(systemName: "mic.fill")
                    .font(.title3)
                    .frame(width: 38, height: 38)
                    .background(.tint.opacity(0.12), in: Circle())
            }
            .buttonStyle(.plain)

            Button(action: send) {
                Image(systemName: "arrow.up.circle.fill")
                    .font(.title)
                    .foregroundStyle(draft.isEmpty ? .tertiary : .tint)
            }
            .disabled(draft.isEmpty)
            .buttonStyle(.plain)
        }
        .padding(.horizontal)
        .padding(.vertical, 10)
        .background(.bar)
    }

    // MARK: - Toolbar (Trails + Echoes as destinations, not tabs)

    @ToolbarContentBuilder
    private var toolbar: some ToolbarContent {
        ToolbarItem(placement: .topBarLeading) {
            Button { showTrails = true } label: {
                Image(systemName: "map")
            }
        }
        ToolbarItem(placement: .principal) {
            VStack(spacing: 0) {
                Text("Conversación").font(.headline)
                if let trail = session.activeTrail {
                    Text(trail.label)
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                        .lineLimit(1)
                }
            }
        }
        ToolbarItem(placement: .topBarTrailing) {
            Button { showEchoes = true } label: {
                Image(systemName: "quote.opening")
            }
        }
    }

    // MARK: - Actions

    private func send() {
        let text = draft.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !text.isEmpty else { return }
        draft = ""
        // PR #3 wires this to SwarmClient.translate(...) and appends the augmented
        // ChatTurn returned by the orchestrator.
        let stub = ChatTurn(
            id: UUID().uuidString, role: "learner",
            surface: ChatSurface(es: text, en: "", alts: [], annotations: [], drillHooks: []),
            wasOffline: true
        )
        turns.append(stub)
    }

    private func holdMic() {
        // PR #3 wires SFSpeechRecognizer here.
    }
}

#Preview { ChatView().environmentObject(SessionStore()) }
