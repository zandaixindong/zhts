import SwiftUI
import Combine

struct ContentView: View {
    @State private var selectedTab = 0
    
    var body: some View {
        TabView(selection: $selectedTab) {
            HomeView()
                .tabItem {
                    Label("发现", systemImage: "sparkles")
                }
                .tag(0)
            
            SeatReservationView()
                .tabItem {
                    Label("座位", systemImage: "chair.lounge.fill")
                }
                .tag(1)
            
            ChatView()
                .tabItem {
                    Label("助手", systemImage: "bubble.left.and.bubble.right.fill")
                }
                .tag(2)
            
            RecommendationNativeView()
                .tabItem {
                    Label("推荐", systemImage: "heart.fill")
                }
                .tag(3)
            
            ProfileView()
                .tabItem {
                    Label("我的", systemImage: "person.crop.circle.fill")
                }
                .tag(4)
        }
        .accentColor(.indigo)
        .onAppear {
            let appearance = UITabBarAppearance()
            appearance.configureWithDefaultBackground()
            UITabBar.appearance().scrollEdgeAppearance = appearance
        }
    }
}
