import SwiftUI
import Combine

struct HomeView: View {
    @StateObject private var network = NetworkManager.shared
    @State private var searchText = ""
    @State private var books: [Book] = []
    @State private var aiMessage = "想读点什么？告诉我你的需求..."
    @State private var isSearching = false
    @State private var searchError = false
    @State private var cancellables = Set<AnyCancellable>()

    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // AI Header - Glassmorphism style
                VStack(alignment: .leading, spacing: 8) {
                    HStack {
                        Image(systemName: "sparkles")
                            .font(.title3)
                            .foregroundColor(.indigo)
                        Text("AI 空间助理")
                            .font(.headline)
                            .foregroundColor(.indigo)
                        Spacer()
                    }
                    
                    Text(aiMessage)
                        .font(.system(.subheadline, design: .rounded))
                        .foregroundColor(.secondary)
                        .lineLimit(2)
                        .fixedSize(horizontal: false, vertical: true)
                }
                .padding()
                .glassBackground()
                .padding()

                // Search Bar
                HStack {
                    Image(systemName: "magnifyingglass")
                        .foregroundColor(.gray)
                    TextField("输入你想读的书或需求...", text: $searchText)
                        .submitLabel(.search)
                        .onSubmit { performSearch() }
                    
                    if !searchText.isEmpty {
                        Button(action: { searchText = "" }) {
                            Image(systemName: "xmark.circle.fill")
                                .foregroundColor(.gray)
                        }
                    }
                }
                .padding()
                .background(Color(.systemGray6))
                .cornerRadius(15)
                .padding(.horizontal)

                if isSearching {
                    ProgressView()
                        .padding(.top, 40)
                    Text("AI 正在全馆检索...")
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .padding()
                    Spacer()
                } else if searchError {
                    ErrorPlaceholderView(title: "搜索请求超时") { performSearch() }
                } else {
                    // Results
                    List(books) { book in
                        BookRow(book: book)
                            .listRowSeparator(.hidden)
                            .listRowBackground(Color.clear)
                    }
                    .listStyle(.plain)
                }
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("发现")
        }
    }

    func performSearch() {
        guard !searchText.isEmpty else { return }
        isSearching = true
        searchError = false
        
        network.request("/books/search", method: "POST", body: ["query": searchText, "userId": "demo-user-id"])
            .sink(receiveCompletion: { completion in
                isSearching = false
                if case .failure = completion { self.searchError = true }
            }, receiveValue: { (response: AISearchResponse) in
                self.books = response.books
                self.aiMessage = response.message
            })
            .store(in: &cancellables)
    }
}

struct BookRow: View {
    let book: Book
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: 4) {
                    Text(book.title)
                        .font(.system(.headline, design: .rounded))
                        .foregroundColor(.primary)
                    Text(book.author)
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                Spacer()
                StatusBadge(status: book.status)
            }
            
            HStack {
                Label(book.category, systemImage: "tag.fill")
                    .font(.caption2)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(Color.indigo.opacity(0.1))
                    .foregroundColor(.indigo)
                    .clipShape(Capsule())
                
                if let loc = book.location {
                    Label(loc, systemImage: "mappin.and.ellipse")
                        .font(.caption2)
                        .foregroundColor(.secondary)
                }
            }
        }
        .padding()
        .background(Color.white)
        .cornerRadius(18)
        .shadow(color: Color.black.opacity(0.03), radius: 5, x: 0, y: 2)
        .padding(.vertical, 4)
    }
}

struct StatusBadge: View {
    let status: String
    var body: some View {
        Text(status == "available" ? "在馆" : "借出")
            .font(.system(size: 10, weight: .bold))
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(status == "available" ? Color.green.opacity(0.1) : Color.red.opacity(0.1))
            .foregroundColor(status == "available" ? .green : .red)
            .clipShape(Capsule())
    }
}
