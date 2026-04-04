import SwiftUI

struct ContentView: View {
    @State private var selectedTab = 0
    
    var body: some View {
        TabView(selection: $selectedTab) {
            HomeView()
                .tabItem {
                    Label("搜索", systemImage: "magnifyingglass")
                }
                .tag(0)
            
            // 占位视图，后续可扩展原生推荐和活动页
            RecommendationNativeView()
                .tabItem {
                    Label("为你推荐", systemImage: "sparkles")
                }
                .tag(1)
            
            Text("我的借阅与画像")
                .tabItem {
                    Label("我的", systemImage: "person.fill")
                }
                .tag(2)
        }
        .accentColor(.indigo)
    }
}

struct RecommendationNativeView: View {
    @State private var recommendations: [AIRecommendation] = []
    @State private var message = "正在通过 AI 分析您的阅读喜好..."
    @State private var cancellables = Set<AnyCancellable>()

    var body: some View {
        NavigationView {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    // AI Summary Card
                    VStack(alignment: .leading, spacing: 10) {
                        HStack {
                            Image(systemName: "quote.opening")
                                .foregroundColor(.indigo.opacity(0.5))
                            Spacer()
                        }
                        Text(message)
                            .font(.system(.body, design: .serif))
                            .italic()
                            .foregroundColor(.primary.opacity(0.8))
                            .lineSpacing(4)
                        HStack {
                            Spacer()
                            Image(systemName: "quote.closing")
                                .foregroundColor(.indigo.opacity(0.5))
                        }
                    }
                    .padding(24)
                    .background(
                        ZStack {
                            Color.indigo.opacity(0.05)
                            Circle()
                                .fill(Color.purple.opacity(0.1))
                                .blur(radius: 40)
                                .offset(x: 100, y: -50)
                        }
                    )
                    .clipShape(RoundedRectangle(cornerRadius: 30))
                    .padding(.horizontal)

                    Text("专属推荐")
                        .font(.title2.bold())
                        .padding(.horizontal)

                    ForEach(recommendations) { rec in
                        VStack(alignment: .leading, spacing: 12) {
                            HStack {
                                Text(rec.title)
                                    .font(.headline)
                                Spacer()
                                Text("\(rec.matchScore)% 匹配")
                                    .font(.caption.bold())
                                    .foregroundColor(.indigo)
                            }
                            
                            Text(rec.reason)
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                                .lineLimit(3)
                            
                            HStack {
                                Spacer()
                                Button("查看详情") { }
                                    .font(.caption.bold())
                                    .padding(.horizontal, 12)
                                    .padding(.vertical, 6)
                                    .background(Color.indigo)
                                    .foregroundColor(.white)
                                    .cornerRadius(8)
                            }
                        }
                        .padding()
                        .background(Color(.secondarySystemGroupedBackground))
                        .cornerRadius(20)
                        .padding(.horizontal)
                    }
                }
                .padding(.vertical)
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("为你推荐")
            .onAppear { loadRecs() }
        }
    }
    
    func loadRecs() {
        NetworkManager.shared.request("/recommendations/for-you?userId=demo-user-id")
            .sink(receiveCompletion: { _ in },
                  receiveValue: { (res: AIRecommendationResponse) in
                self.recommendations = res.recommendations
                self.message = res.message
            })
            .store(in: &cancellables)
    }
}
import AnyCancellable = Combine.AnyCancellable
