// SwarmClient.swift
// Typed Swift mirror of the server/swarm/contracts.ts Zod schemas.
// All request/response types Codable. The actual orchestrator lives on the server.

import Foundation

@MainActor
final class SwarmClient {
    var baseURL: URL = URL(string: "http://localhost:5000")!

    // MARK: - Translate

    struct TranslateRequest: Codable {
        let utterance_en: String
        let trail_context: TrailContext
        let target_skills: [String]
        let target_variant: String
        let retry_hint: String?
    }

    struct TrailContext: Codable {
        let place: String?
        let moment: String?
        let poem_id: String?
        let stanza: Int?
    }

    struct TranslateResponse: Codable {
        let es: String
        let en: String
        let alts: [String]
        let annotations: [Annotation]
        let needs_conjugator: Bool
        let variant_notes: [String: String]
    }

    // MARK: - Calls (stubs in v0; wired in PR #3)

    func translate(_ req: TranslateRequest) async throws -> TranslateResponse {
        // PR #3: POST /api/swarm/translate with the orchestrator on the server side.
        throw URLError(.notConnectedToInternet)
    }
}

/// Token-level annotation — matches `Annotation` in shared/tutor-schema.ts.
struct Annotation: Codable, Hashable {
    let token: String
    let skill: String?
    let note: String?
}
