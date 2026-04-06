import Foundation
import Combine

class NetworkManager: ObservableObject {
    @Published var isLoading = false
    @Published var errorMessage: String? = nil
    
    // ⚠️ 您的云服务器 API 地址
    @Published var baseURL = "http://115.190.223.252:3001/api"
    
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
        request.timeoutInterval = 60 // 延长到 60 秒，避免 AI 接口超时
        
        if let body = body {
            request.httpBody = try? JSONSerialization.data(withJSONObject: body)
        }
        
        return URLSession.shared.dataTaskPublisher(for: request)
            .tryMap { output in
                guard let response = output.response as? HTTPURLResponse else {
                    throw URLError(.badServerResponse)
                }
                if !(200...299).contains(response.statusCode) {
                    print("⚠️ 请求失败: \(response.statusCode) \(endpoint)")
                    throw URLError(.badServerResponse)
                }
                return output.data
            }
            .decode(type: APIResponse<T>.self, decoder: decoder)
            .map(\.data)
            .receive(on: DispatchQueue.main)
            .eraseToAnyPublisher()
    }
}
