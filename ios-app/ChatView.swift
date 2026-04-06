import SwiftUI
import Combine

struct ChatView: View {
    @State private var messages: [ChatMessage] = [
        ChatMessage(role: "assistant", content: "你好！我是你的 AI 图书馆助手。你可以问我关于找书、续借或馆内规则的问题。")
    ]
    @State private var inputText = ""
    @State private var isTyping = false
    @State private var hasError = false

    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                ScrollViewReader { proxy in
                    ScrollView {
                        VStack(spacing: 16) {
                            ForEach(messages) { msg in
                                ChatBubble(message: msg)
                                    .id(msg.id)
                            }
                            if isTyping {
                                HStack {
                                    ProgressView()
                                        .padding()
                                        .background(Color(.systemGray6))
                                        .cornerRadius(20)
                                    Spacer()
                                }.padding(.horizontal)
                            }
                            if hasError {
                                Text("网络连接或解析出错，请重试。")
                                    .font(.caption)
                                    .foregroundColor(.red)
                                    .padding()
                            }
                        }
                        .padding(.vertical)
                    }
                    .onChange(of: messages.count) {
                        withAnimation { proxy.scrollTo(messages.last?.id, anchor: .bottom) }
                    }
                }

                // Input Area
                HStack(spacing: 12) {
                    TextField("输入消息...", text: $inputText)
                        .padding(12)
                        .background(Color(.systemGray6))
                        .cornerRadius(20)
                    
                    Button(action: sendMessage) {
                        Image(systemName: "arrow.up.circle.fill")
                            .font(.system(size: 32))
                            .foregroundColor(.indigo)
                    }
                    .disabled(inputText.isEmpty || isTyping)
                }
                .padding()
                .background(Color.white)
            }
            .navigationTitle("AI 助手")
            .navigationBarTitleDisplayMode(.inline)
        }
    }

    func sendMessage() {
        let text = inputText
        let userMsg = ChatMessage(role: "user", content: text)
        messages.append(userMsg)
        inputText = ""
        isTyping = true
        hasError = false
        
        let assistantMsgId = UUID()
        messages.append(ChatMessage(role: "assistant", content: ""))
        
        guard let url = URL(string: "\(NetworkManager.shared.baseURL)/chat") else { return }
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.addValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let body: [String: Any] = ["messages": [["role": "user", "content": text]], "userId": "demo-user-id"]
        request.httpBody = try? JSONSerialization.data(withJSONObject: body)
        
        Task {
            do {
                let (bytes, response) = try await URLSession.shared.bytes(for: request)
                
                // 检查 HTTP 状态码
                if let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode != 200 {
                    let statusCode = httpResponse.statusCode
                    DispatchQueue.main.async {
                        self.isTyping = false
                        if let index = self.messages.firstIndex(where: { $0.id == assistantMsgId }) {
                            self.messages[index] = ChatMessage(role: "assistant", content: "服务器返回错误代码：\(statusCode)")
                        }
                    }
                    return
                }

                var currentResponse = ""
                DispatchQueue.main.async { self.isTyping = false }
                
                for try await line in bytes.lines {
                    if line.hasPrefix("data: ") {
                        let dataStr = String(line.dropFirst(6))
                        if dataStr == "[DONE]" { break }
                        
                        if let data = dataStr.data(using: .utf8) {
                            do {
                                if let json = try JSONSerialization.jsonObject(with: data) as? [String: Any],
                                   let textChunk = json["text"] as? String {
                                    
                                    currentResponse += textChunk
                                    // Copying string explicitly to avoid Swift 6 concurrency capture mutation warnings
                                    let threadSafeText = String(currentResponse)
                                    
                                    DispatchQueue.main.async {
                                        if let index = self.messages.firstIndex(where: { $0.id == assistantMsgId }) {
                                            self.messages[index] = ChatMessage(role: "assistant", content: threadSafeText)
                                        }
                                    }
                                }
                            } catch {
                                // Silent fail for JSON chunks
                            }
                        }
                    }
                }
                
                // 防御性检查：如果什么都没收到
                let finalCheckText = String(currentResponse)
                DispatchQueue.main.async {
                    if finalCheckText.isEmpty {
                        if let index = self.messages.firstIndex(where: { $0.id == assistantMsgId }) {
                            self.messages[index] = ChatMessage(role: "assistant", content: "抱歉，由于 API 格式或响应问题未能加载内容。")
                        }
                    }
                }

            } catch {
                DispatchQueue.main.async {
                    self.isTyping = false
                    self.hasError = true
                    if let index = self.messages.firstIndex(where: { $0.id == assistantMsgId }) {
                        self.messages.remove(at: index)
                    }
                }
            }
        }
    }
}

struct ChatBubble: View {
    let message: ChatMessage
    var isUser: Bool { message.role == "user" }

    var body: some View {
        HStack {
            if isUser { Spacer() }
            
            Text(message.content)
                .padding(.horizontal, 16)
                .padding(.vertical, 12)
                .background(isUser ? Color.indigo : Color(.systemGray5))
                .foregroundColor(isUser ? .white : .primary)
                .cornerRadius(20, corners: isUser ? [.topLeft, .topRight, .bottomLeft] : [.topLeft, .topRight, .bottomRight])
                .font(.system(.body, design: .rounded))
            
            if !isUser { Spacer() }
        }
        .padding(.horizontal)
    }
}
