// TripSpanishTutorApp.swift
// TripSpanishTutor — native SwiftUI client.

import SwiftUI

@main
struct TripSpanishTutorApp: App {
    @StateObject private var session = SessionStore()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(session)
                .preferredColorScheme(.dark) // Nexus palette favors the dark variant for an evening Borges read
        }
    }
}

/// Top-level state. Holds the active learner, the active trail, and the SwarmClient.
@MainActor
final class SessionStore: ObservableObject {
    @Published var activeLearner: Learner?
    @Published var activeTrail: Trail?

    let swarm = SwarmClient()
    let store = LocalStore()
}
