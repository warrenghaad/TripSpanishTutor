// LocalStore.swift
// Offline cache. The trail is the cache: when a learner starts a trail, every
// scenelet / poem / lemma / verb form / drill prompt is persisted locally.
// v0 stubs the actor; PR #4 wires GRDB.

import Foundation

@MainActor
final class LocalStore {

    enum BakeStatus { case absent, partial, baked, stale }

    /// Returns the bake status of a trail. Used by TrailsView to show the green dot.
    func bakeStatus(trailId: String) async -> BakeStatus {
        // PR #4: read from cache_manifest in GRDB.
        return .absent
    }

    /// Pre-bakes a trail. Streams the content bundle from the API and writes it to SQLite.
    /// Idempotent — calling twice on a baked trail is a no-op.
    func bake(trailId: String) async throws {
        // PR #4: implement GRDB persistence + cache_manifest update.
    }

    /// Queue a learner utterance for later swarm validation. Used when offline.
    func queueUtterance(_ text: String, trailId: String?) async throws {
        // PR #4: append to outbox table; SyncService drains when network returns.
    }
}
