import SwiftUI
import Combine

struct SeatReservationView: View {
    @State private var floors: [Floor] = []
    @State private var selectedFloor: Floor?
    @State private var seats: [Seat] = []
    @State private var isLoading = false
    @State private var hasError = false
    @State private var showConfirm = false
    @State private var selectedSeat: Seat?
    @State private var cancellables = Set<AnyCancellable>()

    let columns = [
        GridItem(.adaptive(minimum: 55, maximum: 70), spacing: 15)
    ]

    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // 楼层选择器
                if !floors.isEmpty {
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 12) {
                            ForEach(floors) { floor in
                                Button(action: { selectFloor(floor) }) {
                                    Text(floor.name)
                                        .font(.system(.subheadline, design: .rounded).bold())
                                        .padding(.horizontal, 16)
                                        .padding(.vertical, 8)
                                        .background(selectedFloor?.id == floor.id ? Color.indigo : Color.white)
                                        .foregroundColor(selectedFloor?.id == floor.id ? .white : .primary)
                                        .clipShape(Capsule())
                                        .shadow(color: Color.black.opacity(0.05), radius: 5)
                                }
                            }
                        }
                        .padding()
                    }
                    .background(Color(.systemBackground))
                }

                if isLoading {
                    Spacer()
                    ProgressView("加载实时座次...")
                    Spacer()
                } else if hasError {
                    ErrorPlaceholderView(title: "无法连接服务器") { loadFloors() }
                } else {
                    ScrollView {
                        LazyVGrid(columns: columns, spacing: 20) {
                            ForEach(seats) { seat in
                                Button(action: {
                                    if seat.status == "available" {
                                        self.selectedSeat = seat
                                        self.showConfirm = true
                                    }
                                }) {
                                    SeatIcon(seat: seat)
                                }
                                .buttonStyle(PlainButtonStyle())
                            }
                        }
                        .padding(20)
                        
                        VStack(alignment: .leading, spacing: 15) {
                            Text("图例说明").font(.headline)
                            HStack(spacing: 20) {
                                LegendItem(color: .emerald, text: "空闲")
                                LegendItem(color: .rose, text: "占用")
                            }
                        }
                        .padding()
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(Color.white)
                        .cornerRadius(20)
                        .padding()
                    }
                }
            }
            .navigationTitle("座位预约")
            .background(Color(.systemGroupedBackground))
            .onAppear { loadFloors() }
            .alert(isPresented: $showConfirm) {
                Alert(
                    title: Text("确认预约"),
                    message: Text("您确定要预约 \(selectedFloor?.name ?? "") 的 \(selectedSeat?.seatNumber ?? "") 号座位吗？"),
                    primaryButton: .cancel(Text("取消")),
                    secondaryButton: .default(Text("立即锁定"), action: reserveSeat)
                )
            }
        }
    }

    func reserveSeat() {
        guard let seat = selectedSeat else { return }
        isLoading = true
        // 🛠️ 修复：更改接收数据类型为 ReserveSeatResponse，解决解析失败导致的“无法连接服务器”报错
        NetworkManager.shared.request("/seats/reserve", method: "POST", body: ["seatId": seat.id, "duration": 2, "userId": "demo-user-id"])
            .sink(receiveCompletion: { completion in
                if case .failure = completion { 
                    self.hasError = true
                    self.isLoading = false 
                }
            }, receiveValue: { (res: ReserveSeatResponse) in 
                // 预约成功后，重新刷新当前楼层数据
                if let floor = selectedFloor { selectFloor(floor) }
            })
            .store(in: &cancellables)
    }

    func loadFloors() {
        isLoading = true; hasError = false
        NetworkManager.shared.request("/seats/floors")
            .sink(receiveCompletion: { completion in
                if case .failure = completion { self.hasError = true; self.isLoading = false }
            }, receiveValue: { (res: [Floor]) in
                self.floors = res
                if let first = res.first { selectFloor(first) }
                else { self.isLoading = false }
            })
            .store(in: &cancellables)
    }

    func selectFloor(_ floor: Floor) {
        selectedFloor = floor
        isLoading = true
        NetworkManager.shared.request("/seats/floor/\(floor.id)")
            .sink(receiveCompletion: { _ in self.isLoading = false },
                  receiveValue: { (res: [Seat]) in
                self.seats = res
            })
            .store(in: &cancellables)
    }
}

struct SeatIcon: View {
    let seat: Seat
    var body: some View {
        VStack(spacing: 4) {
            Image(systemName: seat.status == "available" ? "chair.lounge.fill" : "person.fill.viewfinder")
                .font(.title2)
                .foregroundColor(seat.status == "available" ? .emerald : .rose)
            Text(seat.seatNumber)
                .font(.system(size: 10, weight: .bold, design: .monospaced))
                .foregroundColor(.secondary)
        }
        .frame(width: 55, height: 55)
        .background(Color.white)
        .cornerRadius(12)
        .shadow(color: Color.black.opacity(0.03), radius: 2)
    }
}

struct LegendItem: View {
    let color: Color
    let text: String
    var body: some View {
        HStack(spacing: 6) {
            Circle().fill(color).frame(width: 8, height: 8)
            Text(text).font(.caption).foregroundColor(.secondary)
        }
    }
}
