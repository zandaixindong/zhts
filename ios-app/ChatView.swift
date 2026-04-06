import SwiftUI
import Combine

struct ChatView: View {
    @State private var messages: [ChatMessage] = [
        ChatMessage(role: "assistant", content: "你好！我是你的 AI 图书馆助手。你可以问我关于找书、续借或馆内规则的问题。")
    ]
    @State private var inputText = ""
    @State private var isTyping = false
    @State private var hasError = false
    @State private var cancellables = Set<AnyCancellable>() // 🛠️ 修复：添加缺失的变量

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
        
        struct ChatResponse: Codable {
            let text: String
        }
        
        NetworkManager.shared.request("/chat?stream=false", method: "POST", body: ["messages": [["role": "user", "content": text]], "userId": "demo-user-id"])
            .sink(receiveCompletion: { completion in
                self.isTyping = false
                if case .failure = completion { self.hasError = true }
            }, receiveValue: { (res: ChatResponse) in
                self.messages.append(ChatMessage(role: "assistant", content: res.text))
            })
            .store(in: &cancellables)
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
