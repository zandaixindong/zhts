import Foundation

// MARK: - API 基础响应包装
struct APIResponse<T: Codable>: Codable {
    let success: Bool
    let data: T
}

// MARK: - 图书模型
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

// MARK: - AI 搜索响应
struct AISearchResponse: Codable {
    let books: [Book]
    let message: String
}

// MARK: - AI 推荐模型
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

// MARK: - 借阅画像
struct AIPersona: Codable {
    let title: String
    let traits: [String]
    let radar: [String: Int]
    let summary: String
}

// MARK: - 座位与楼层
struct Floor: Identifiable, Codable {
    let id: String
    let name: String
    let number: Int?
}

struct Seat: Identifiable, Codable {
    let id: String
    let seatNumber: String
    let status: String // available, occupied
    let zone: String?
    let hasOutlet: Bool?
    let window: Bool?
}

// 🛠️ 关键修复：预约结果模型
struct ReserveSeatResponse: Codable {
    let success: Bool
    let message: String
    let seat: Seat?
}

// MARK: - 记录模型
struct BorrowingRecord: Identifiable, Codable {
    let id: String
    let status: String
    let dueDate: String
    let book: Book
}

struct ReservationRecord: Identifiable, Codable {
    let id: String
    let status: String
    let startTime: String
    let endTime: String
    let seat: Seat
}

// MARK: - 聊天模型
struct ChatMessage: Identifiable, Codable {
    var id = UUID()
    let role: String // user, assistant
    let content: String
    
    init(role: String, content: String) {
        self.id = UUID()
        self.role = role
        self.content = content
    }
}
