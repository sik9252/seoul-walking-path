import { Course, WalkRecord } from "../domain/types";

export const initialCourses: Course[] = [
  {
    id: "c1",
    name: "남산 둘레길 (북측순환로)",
    subtitle: "사계절 내내 걷기 좋은 서울 대표 산책 코스",
    district: "중구 예장동",
    distanceKm: 3.5,
    durationMin: 80,
    difficulty: "쉬움",
    rating: 4.8,
    reviewCount: 1240,
    tags: ["숲길", "야경"],
    isFavorite: true,
    description:
      "서울의 역사와 자연을 함께 느낄 수 있는 대표 산책로입니다. 경사가 완만해 누구나 즐길 수 있어요.",
    points: [
      { title: "창의문", detail: "코스 시작점 · 화장실 있음" },
      { title: "백악마루", detail: "포토 스팟 · 1.2km 지점" },
      { title: "말바위 안내소", detail: "휴식 공간 · 물 보충 가능" },
    ],
  },
  {
    id: "c2",
    name: "서울숲 힐링 코스",
    subtitle: "도심 속 숲길을 따라 걷는 여유로운 산책로",
    district: "성동구 성수동",
    distanceKm: 4.2,
    durationMin: 100,
    difficulty: "보통",
    rating: 4.7,
    reviewCount: 892,
    tags: ["숲길", "공원"],
    isFavorite: false,
    description: "계절 식물과 열린 공원을 따라 걷는 평탄한 코스입니다.",
    points: [
      { title: "나비정원", detail: "초반 포인트 · 포토 스팟" },
      { title: "수변 산책로", detail: "중반 · 벤치 다수" },
    ],
  },
  {
    id: "c3",
    name: "낙산 성곽길 야경 코스",
    subtitle: "서울의 야경을 한눈에 담을 수 있는 로맨틱 코스",
    district: "종로구 이화동",
    distanceKm: 2.1,
    durationMin: 50,
    difficulty: "쉬움",
    rating: 4.9,
    reviewCount: 2105,
    tags: ["문화유산", "야경"],
    isFavorite: true,
    description: "해질 무렵 출발하면 성곽 너머 서울 야경이 아름답게 펼쳐집니다.",
    points: [{ title: "이화벽화마을", detail: "시작점 · 카페 다수" }],
  },
];

export const records: WalkRecord[] = [
  {
    id: "r1",
    courseId: "c1",
    title: "남산 둘레길 코스",
    startedAt: "2023년 10월 24일 오전 9:30",
    distanceKm: 5.2,
    durationText: "1:24:30",
    paceText: "16'15\" /km",
  },
  {
    id: "r2",
    courseId: "c2",
    title: "한강공원 산책",
    startedAt: "2023년 10월 23일 오후 7:10",
    distanceKm: 3.8,
    durationText: "45분",
    paceText: "11'50\" /km",
  },
];
