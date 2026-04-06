import SwiftUI
import UIKit

// MARK: - Blur Effect (Glassmorphism Helper)
struct Blur: UIViewRepresentable {
    var style: UIBlurEffect.Style = .systemMaterial
    
    func makeUIView(context: Context) -> UIVisualEffectView {
        return UIVisualEffectView(effect: UIBlurEffect(style: style))
    }
    
    func updateUIView(_ uiView: UIVisualEffectView, context: Context) {
        uiView.effect = UIBlurEffect(style: style)
    }
}

// MARK: - Common Extensions
extension View {
    func glassBackground(cornerRadius: CGFloat = 20) -> some View {
        self.background(
            RoundedRectangle(cornerRadius: cornerRadius)
                .fill(Color.white.opacity(0.7))
                .background(Blur(style: .systemThinMaterial))
                .shadow(color: Color.black.opacity(0.05), radius: 10, x: 0, y: 5)
        )
    }
    
    func cornerRadius(_ radius: CGFloat, corners: UIRectCorner) -> some View {
        clipShape( RoundedCorner(radius: radius, corners: corners) )
    }
}

// MARK: - Custom Shapes
struct RoundedCorner: Shape {
    var radius: CGFloat = .infinity
    var corners: UIRectCorner = .allCorners

    func path(in rect: CGRect) -> Path {
        let path = UIBezierPath(roundedRect: rect, byRoundingCorners: corners, cornerRadii: CGSize(width: radius, height: radius))
        return Path(path.cgPath)
    }
}

// MARK: - Custom Color Palette
extension Color {
    static let emerald = Color(red: 0.06, green: 0.69, blue: 0.44)
    static let rose = Color(red: 0.88, green: 0.07, blue: 0.37)
    static let slate50 = Color(red: 0.96, green: 0.97, blue: 0.99)
}

// MARK: - Error Placeholder
struct ErrorPlaceholderView: View {
    let title: String
    let action: () -> Void
    var body: some View {
        VStack(spacing: 15) {
            Image(systemName: "wifi.exclamationmark")
                .font(.system(size: 50))
                .foregroundColor(.gray)
            Text(title)
                .font(.headline)
                .foregroundColor(.secondary)
            Button("点击重试") { action() }
                .padding(.horizontal, 20)
                .padding(.vertical, 8)
                .background(Color.indigo)
                .foregroundColor(.white)
                .cornerRadius(10)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}
