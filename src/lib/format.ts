// 가격을 "12,000원" 또는 "나눔🩷" 으로 보여준다
export function formatPrice(price: number) {
  if (!price || price <= 0) return "나눔 🩷";
  return `${price.toLocaleString("ko-KR")}원`;
}

// 판매상태별 배지 색상 (Tailwind 클래스)
export function statusBadgeClass(status: string) {
  switch (status) {
    case "예약중":
      return "bg-grape/10 text-grape";
    case "거래완료":
      return "bg-black/10 text-foreground/50";
    default: // 판매중
      return "bg-sweet/15 text-sweet-dark";
  }
}
