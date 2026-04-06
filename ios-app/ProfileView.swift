import SwiftUI
import Combine

struct ProfileView: View {
    @State private var persona: AIPersona?
    @State private var isLoadingPersona = true
    @State private var cancellables = Set<AnyCancellable>()

    var body: some View {
        NavigationView {
            List {
                Section {
                    HStack(spacing: 15) {
                        Circle().fill(LinearGradient(gradient: Gradient(colors: [.indigo, .purple]), startPoint: .topLeading, endPoint: .bottomTrailing))
                            .frame(width: 60, height: 60)
                            .overlay(Text("JS").foregroundColor(.white).bold())
                        
                        VStack(alignment: .leading) {
                            Text("演示用户").font(.headline)
                            Text("demo@university.edu").font(.subheadline).foregroundColor(.secondary)
                        }
                    }.padding(.vertical, 8)
                }
                
                // AI 借阅画像
                Section("AI 年度借阅画像") {
                    if isLoadingPersona {
                        ProgressView().padding()
                    } else if let persona = persona {
                        VStack(alignment: .leading, spacing: 12) {
                            HStack {
                                Image(systemName: "sparkles").foregroundColor(.amber)
                                Text(persona.title).font(.headline.bold())
                                Spacer()
                            }
                            HStack {
                                ForEach(persona.traits, id: \.self) { trait in
                                    Text("#\(trait)")
                                        .font(.caption2.bold())
                                        .padding(5)
                                        .background(Color.indigo.opacity(0.1))
                                        .foregroundColor(.indigo)
                                        .cornerRadius(6)
                                }
                            }
                            Text(persona.summary)
                                .font(.system(size: 13, design: .rounded))
                                .foregroundColor(.secondary)
                        }
                        .padding(.vertical, 8)
                    }
                }
                
                Section("我的资产") {
                    NavigationLink(destination: BorrowingHistoryView()) {
                        Label("借阅历史详情", systemImage: "book.fill")
                    }
                    NavigationLink(destination: ReservationHistoryView()) {
                        Label("座位预约记录", systemImage: "calendar")
                    }
                }
                
                Section("系统设置") {
                    Label("通知中心", systemImage: "bell.badge.fill")
                    Label("个人资料", systemImage: "person.text.rectangle")
                    Label("设置", systemImage: "gearshape.fill")
                }
                
                Section {
                    Button(action: {}) {
                        Text("退出登录").foregroundColor(.red).bold().frame(maxWidth: .infinity)
                    }
                }
            }
            .navigationTitle("个人中心")
            .onAppear { loadPersona() }
        }
    }

    func loadPersona() {
        NetworkManager.shared.request("/my-activity/persona/demo-user-id")
            .sink(receiveCompletion: { _ in isLoadingPersona = false },
                  receiveValue: { (res: AIPersona) in
                self.persona = res
            }).store(in: &cancellables)
    }
}

// MARK: - 借阅历史视图
struct BorrowingHistoryView: View {
    @State private var records: [BorrowingRecord] = []
    @State private var isLoading = true
    @State private var cancellables = Set<AnyCancellable>()

    var body: some View {
        ScrollView {
            if isLoading {
                ProgressView().padding(.top, 50)
            } else if records.isEmpty {
                VStack {
                    Image(systemName: "tray.fill").font(.system(size: 50)).foregroundColor(.gray.opacity(0.3)).padding()
                    Text("暂无活跃借阅").font(.headline).foregroundColor(.secondary)
                }.padding(.top, 100)
            } else {
                LazyVStack(spacing: 15) {
                    ForEach(records) { record in
                        VStack(alignment: .leading, spacing: 8) {
                            HStack {
                                Text(record.book.title).font(.headline)
                                Spacer()
                                Text(record.status == "borrowed" ? "借阅中" : "已归还")
                                    .font(.caption.bold())
                                    .foregroundColor(record.status == "borrowed" ? .green : .gray)
                            }
                            Text(record.book.author).font(.subheadline).foregroundColor(.secondary)
                            Text("到期时间: \(String(record.dueDate.prefix(10)))")
                                .font(.caption2)
                                .foregroundColor(record.status == "borrowed" ? .red : .secondary)
                        }
                        .padding().background(Color.white).cornerRadius(15).shadow(radius: 2)
                    }
                }.padding()
            }
        }
        .background(Color(.systemGroupedBackground))
        .navigationTitle("借阅历史")
        .onAppear { loadBorrowings() }
    }

    func loadBorrowings() {
        NetworkManager.shared.request("/my-activity/borrowing/demo-user-id")
            .sink(receiveCompletion: { _ in isLoading = false }, receiveValue: { (res: [BorrowingRecord]) in
                self.records = res
            }).store(in: &cancellables)
    }
}

// MARK: - 预约记录视图
struct ReservationHistoryView: View {
    @State private var records: [ReservationRecord] = []
    @State private var isLoading = true
    @State private var cancellables = Set<AnyCancellable>()

    var body: some View {
        ScrollView {
            if isLoading {
                ProgressView().padding(.top, 50)
            } else if records.isEmpty {
                VStack {
                    Image(systemName: "calendar.badge.clock").font(.system(size: 50)).foregroundColor(.gray.opacity(0.3)).padding()
                    Text("暂无预约记录").font(.headline).foregroundColor(.secondary)
                }.padding(.top, 100)
            } else {
                LazyVStack(spacing: 15) {
                    ForEach(records) { record in
                        VStack(alignment: .leading, spacing: 8) {
                            HStack {
                                Text("座位 \(record.seat.seatNumber)").font(.headline)
                                Spacer()
                                Text(record.status)
                                    .font(.caption.bold())
                                    .foregroundColor(.indigo)
                            }
                            Text("开始时间: \(String(record.startTime.prefix(16).replacingOccurrences(of: "T", with: " ")))")
                                .font(.caption2).foregroundColor(.secondary)
                            Text("结束时间: \(String(record.endTime.prefix(16).replacingOccurrences(of: "T", with: " ")))")
                                .font(.caption2).foregroundColor(.secondary)
                        }
                        .padding().background(Color.white).cornerRadius(15).shadow(radius: 2)
                    }
                }.padding()
            }
        }
        .background(Color(.systemGroupedBackground))
        .navigationTitle("座位预约记录")
        .onAppear { loadReservations() }
    }

    func loadReservations() {
        // 由于后端限制，iOS原生的模型解包需要匹配 `{ reservations: [...] }`，所以我们定义一个临时结构体
        struct ResWrapper: Codable { let reservations: [ReservationRecord] }
        NetworkManager.shared.request("/seats/my-reservation/history?userId=demo-user-id")
            .sink(receiveCompletion: { _ in isLoading = false }, receiveValue: { (res: ResWrapper) in
                self.records = res.reservations
            }).store(in: &cancellables)
    }
}

extension Color {
    static let amber = Color(red: 1.00, green: 0.75, blue: 0.00)
}
