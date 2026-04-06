import SwiftUI
import Combine

struct RecommendationNativeView: View {
    @State private var recommendations: [AIRecommendation] = []
    @State private var message = "正在通过 AI 分析您的阅读喜好..."
    @State private var isLoading = false
    @State private var hasError = false
    @State private var cancellables = Set<AnyCancellable>()

    var body: some View {
        NavigationView {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    // AI Summary Card
                    VStack(alignment: .leading, spacing: 12) {
                        HStack {
                            Image(systemName: "sparkles")
                                .foregroundColor(.indigo)
                            Text("AI 个性化导读")
                                .font(.caption.bold())
                                .foregroundColor(.indigo)
                            Spacer()
                        }
                        
                        Text(message)
                            .font(.system(.body, design: .rounded))
                            .foregroundColor(.primary.opacity(0.8))
                            .lineSpacing(6)
                            .italic()
                    }
                    .padding(24)
                    .glassBackground()
                    .padding(.horizontal)

                    Text("为你精选")
                        .font(.system(.title2, design: .rounded).bold())
                        .padding(.horizontal)

                    if isLoading && recommendations.isEmpty {
                        ProgressView().frame(maxWidth: .infinity).padding(.top, 40)
                    } else if hasError {
                        ErrorPlaceholderView(title: "获取推荐失败") { loadRecs() }
                    }

                    ForEach(recommendations) { rec in
                        VStack(alignment: .leading, spacing: 15) {
                            HStack {
                                Text(rec.title)
                                    .font(.system(.headline, design: .rounded))
                                Spacer()
                                Text("\(rec.matchScore)%")
                                    .font(.system(.caption, design: .monospaced).bold())
                                    .padding(.horizontal, 8).padding(.vertical, 4)
                                    .background(Color.indigo.opacity(0.1))
                                    .foregroundColor(.indigo).cornerRadius(8)
                            }
                            
                            Text(rec.author).font(.subheadline).foregroundColor(.secondary)
                            
                            Text(rec.reason)
                                .font(.system(.subheadline, design: .rounded))
                                .foregroundColor(.primary.opacity(0.7))
                                .padding(12).background(Color.slate50).cornerRadius(12)
                        }
                        .padding(20).background(Color.white).cornerRadius(24)
                        .shadow(color: Color.black.opacity(0.02), radius: 10, x: 0, y: 5)
                        .padding(.horizontal)
                    }
                }
                .padding(.vertical)
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("为你推荐")
            .refreshable { loadRecs() }
            .onAppear { loadRecs() }
        }
    }
    
    func loadRecs() {
        isLoading = true; hasError = false
        NetworkManager.shared.request("/recommendations/for-you?userId=demo-user-id")
            .sink(receiveCompletion: { completion in
                isLoading = false
                if case .failure = completion { self.hasError = true }
            }, receiveValue: { (res: AIRecommendationResponse) in
                self.recommendations = res.recommendations
                self.message = res.message
            })
            .store(in: &cancellables)
    }
}
