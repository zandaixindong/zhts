import Foundation

// MARK: - Core Data Models
struct Book: Identifiable, Codable {
    let id: String
    let title: String
    let author: String
    let category: String
    let status: String
    let description: String?
    let location: String?
    let isbn: String?
}

struct AISearchResponse: Codable {
    let books: [Book]
    let message: String
}

struct AIRecommendation: Identifiable, Codable {
    var id: String { bookId }
    let bookId: String
    let title: String
    let author: String
    let reason: String
    let matchScore: Int
}

struct AIRecommendationResponse: Codable {
    let recommendations: [AIRecommendation]
    let message: String
}

struct AIPersona: Codable {
    let title: String
    let traits: [String]
    let radar: [String: Int]
    let summary: String
}

struct APIResponse<T: Codable>: Codable {
    let success: Bool
    let data: T
}
