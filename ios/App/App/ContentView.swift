// ContentView.swift
//
// Root view = the translator/chat directly. No tab bar, no nav stack to wade through.
// You open the app, the input bar is already focused, and your last conversation
// is right there.
//
// Trails and Echoes are reachable from the top toolbar (icon buttons), not from a
// bottom tab bar — they're destinations you go to, not modes you choose between.

import SwiftUI

struct ContentView: View {
    var body: some View {
        ChatView()
    }
}

#Preview { ContentView().environmentObject(SessionStore()) }
