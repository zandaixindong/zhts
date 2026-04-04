import Foundation
import Combine

class NetworkManager: ObservableObject {
    @Published var isLoading = false
    
    // ⚠️ 请在部署后修改此处的 URL 为您的云端地址
    // 例如: "https://ai-library-backend.onrender.com/api"
    private let baseURL = "http://localhost:3001/api"
    
    static let shared = NetworkManager()
    
    private let decoder: JSONDecoder = {
        let decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .useDefaultKeys
        return decoder
    }()

    func request<T: Codable>(_ endpoint: String, method: String = "GET", body: [String: Any]? = nil) -> AnyPublisher<T, Error> {
        guard let url = URL(string: "\(baseURL)\(endpoint)") else {
            return Fail(error: URLError(.badURL)).eraseToAnyPublisher()
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = method
        request.addValue("application/json", forHTTPHeaderField: "Content-Type")
        
        if let body = body {
            request.httpBody = try? JSONSerialization.data(withJSONObject: body)
        }
        
        return URLSession.shared.dataTaskPublisher(for: request)
            .map(\.data)
            .decode(type: APIResponse<T>.self, decoder: decoder)
            .map(\.data)
            .receive(on: DispatchQueue.main)
            .eraseToAnyPublisher()
    }
}
