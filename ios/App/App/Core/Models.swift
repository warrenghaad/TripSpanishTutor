// Models.swift
// Hand-written Swift models for v0. These will move to Generated/Schema.swift
// once `scripts/codegen-swift.ts` ships in this PR.

import Foundation

// MARK: - Learner

struct Learner: Identifiable, Codable, Hashable {
    let id: String
    let handle: String
    let locale: String
    let targetVariant: String
}

// MARK: - Trail

struct Trail: Identifiable, Codable, Hashable {
    let id: String
    let learnerId: String
    let packId: String?
    let label: String
    let status: String

    static let previewList: [Trail] = [
        Trail(id: "t-borges-1", learnerId: "me", packId: "borges.fervor",
              label: "Fervor de Buenos Aires (1923) — first trail", status: "active"),
        Trail(id: "t-travel-1", learnerId: "me", packId: "travel.phx-pvr",
              label: "PHX → PVR · arrival scenelets", status: "draft"),
        Trail(id: "t-travel-2", learnerId: "me", packId: "travel.argentina",
              label: "Argentina — Borges pilgrimage + practical travel", status: "draft"),
    ]
}

// MARK: - Chat surface

struct ChatTurn: Identifiable, Codable, Hashable {
    let id: String
    let role: String                 // learner | tutor | system
    let surface: ChatSurface
    let wasOffline: Bool

    static let preview = ChatTurn(
        id: "preview-1",
        role: "tutor",
        surface: ChatSurface(
            es: "Estoy en el aeropuerto, acabo de aterrizar.",
            en: "I'm at the airport, I just landed.",
            alts: ["Ya llegué al aeropuerto.", "Acabo de bajar del avión."],
            annotations: [
                Annotation(token: "Estoy", skill: "verb.estar.present.location",
                           note: "estar for temporary location"),
                Annotation(token: "aeropuerto", skill: "vocab.aeropuerto", note: nil),
            ],
            drillHooks: [DrillHook(skillId: "verb.estar.present.location", kind: "conjugate")]
        ),
        wasOffline: false
    )

    static let previewLearner = ChatTurn(
        id: "preview-2",
        role: "learner",
        surface: ChatSurface(
            es: "¿Dónde queda el taxi?",
            en: "Where is the taxi?",
            alts: ["¿Dónde están los taxis?"],
            annotations: [
                Annotation(token: "queda", skill: "verb.quedar.location",
                           note: "queda for fixed location — locals prefer this over está here"),
            ],
            drillHooks: [DrillHook(skillId: "verb.quedar.location", kind: "cloze")]
        ),
        wasOffline: true
    )
}

struct ChatSurface: Codable, Hashable {
    let es: String
    let en: String
    let alts: [String]
    let annotations: [Annotation]
    let drillHooks: [DrillHook]
}

struct DrillHook: Codable, Hashable {
    let skillId: String
    let kind: String
}
